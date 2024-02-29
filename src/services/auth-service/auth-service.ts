import {AuthRepository} from "../../repositories/auth/auth-repository";
import {BcryptService} from "../bcrypt-service";
import {JwtService} from "../jwt-service";
import {LoginOutputModel} from "../../models/auth-models/output/login-output-model";
import {RegistrationInputModel} from "../../models/auth-models/input/registration-input-model";
import {UserDb} from "../../models/user-models/db/user-db";
import {UserRepository} from "../../repositories/user/user-repository";
import {emailAdapter} from "../../adapters/email-adapter";
import {v4 as uuidv4} from 'uuid';
import {add, isBefore} from "date-fns";
import {ObjectId, WithId} from "mongodb";
import {generateConfirmationEmailMessage} from "./generate-confirmation-email-message";
import {UserService} from "../user-service";
import {DeviceAuthSessionsDb} from "../../models/device-auth-sessions-models/db/device-auth-sessions-db";
import {SecurityDevicesRepository} from "../../repositories/security-devices/security-devices-repository";
import {SETTINGS_REWRITE} from "../../app";

export class AuthService {
  static async login(loginOrEmail: string, password: string, ip: string, deviceName: string): Promise<null | LoginOutputModel & {
    refreshToken: string
  }> {
    const user = await AuthRepository.getSearchedUser(loginOrEmail)
    if (!user) return null

    const isPassValid = await BcryptService.compareHashes(password, user.hash)
    if (!isPassValid) return null

    const deviceId = uuidv4()
    const refreshTokenPayload = {
      deviceId,
      userId: user._id.toString(),
    }

    const accessToken = await JwtService.createJWT(user, SETTINGS_REWRITE.ACCESS_EXP_TOKEN_TIME)
    const refreshToken = await JwtService.createJWTRefreshToken(refreshTokenPayload, SETTINGS_REWRITE.REFRESH_EXP_TOKEN_TIME)

    const expDate = await JwtService.getExpirationDate(refreshToken)
    if (!expDate) return null

    const sessionData: DeviceAuthSessionsDb = {
      issuedAt: expDate,
      userId: user._id.toString(),
      ip,
      deviceId,
      deviceName: deviceName ?? 'unknown',
      lastActiveDate: new Date().toISOString()
    }

    const isSessionSaved = await SecurityDevicesRepository.saveDeviceSession(sessionData)
    if (!isSessionSaved) return null

    return {accessToken, refreshToken}
  }

  static async refreshTokens(oldRefreshToken: string, userId: ObjectId, deviceId: string): Promise<null | LoginOutputModel & {
    refreshToken: string
  }> {
    const user = await UserService.getUserById(userId)
    if (!user) return null

    const accessToken = await JwtService.createJWT(user, SETTINGS_REWRITE.ACCESS_EXP_TOKEN_TIME)
    const refreshToken = await JwtService.createJWTRefreshToken({
      deviceId,
      userId: user._id.toString(),
    }, SETTINGS_REWRITE.REFRESH_EXP_TOKEN_TIME)

    const expDate = await JwtService.getExpirationDate(refreshToken)
    if (!expDate) return null

    const lastActiveDate = new Date().toISOString()

    const isSessionUpdate = await SecurityDevicesRepository.updateDeviceSession(expDate, lastActiveDate, userId.toString(), deviceId)
    if (!isSessionUpdate) return null

    return {accessToken, refreshToken}
  }

  static async logout(deviceId: string): Promise<boolean> {
    return await SecurityDevicesRepository.deleteSessionByDeviceId(deviceId)
  }

  static async register(registerUserModel: RegistrationInputModel): Promise<WithId<UserDb> | null> {
    const {email, password, login} = registerUserModel

    const hash = await BcryptService.generateHash(password)

    const newUser: UserDb = {
      email,
      login,
      createdAt: new Date().toISOString(),
      hash,
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 2
        }),
        isConfirmed: false
      }
    }

    const createdUser = await AuthRepository.createUser(newUser)

    if (!createdUser) return null

    try {
      await emailAdapter.sendEmail(email, 'Confirm registration', generateConfirmationEmailMessage(createdUser!._id.toString(), createdUser.emailConfirmation!.confirmationCode!, 'code'))
    } catch (e) {
      console.log('AuthService/register', e)
      await UserRepository.deleteUser(createdUser!._id.toString())
      return null
    }


    return createdUser
  }

  static async confirmEmail(code: string): Promise<null | boolean> {
    const [userId, token] = code.split(' ')

    const user = await AuthRepository.getUserById(userId)
    if (!user) return null

    const dateUser = user.emailConfirmation!.expirationDate as Date

    const isExpire = isBefore(dateUser, new Date())

    if (token !== user.emailConfirmation!.confirmationCode || isExpire || user.emailConfirmation!.isConfirmed) {
      return null
    }

    const isConfStatusChanged = await AuthRepository.updateConfirmationStatus(user._id)
    if (!isConfStatusChanged) return null

    return isConfStatusChanged
  }

  static async resendEmail(email: string): Promise<null | boolean> {
    const user = await AuthRepository.getSearchedUser(email)
    if (!user) return null

    if (user.emailConfirmation!.isConfirmed) return null

    const newCode = uuidv4()

    const isConfCodeUpdated = await AuthRepository.updateConfirmationCode(user._id, newCode)

    if (!isConfCodeUpdated) return false

    try {
      await emailAdapter.sendEmail(email, 'Confirm registration', generateConfirmationEmailMessage(user._id.toString(), newCode, 'code'))
    } catch (e) {
      console.log('AuthService/resendEmail', e)
      return false
    }

    return true
  }

  static async sendPassRecoverInstructions(email: string): Promise<boolean> {
    try {
      const user = await AuthRepository.getSearchedUser(email)
      if (!user) return !!'user is not found'

      const confirmationCode = uuidv4()
      const expirationDate = add(new Date(), {
        hours: 1,
        minutes: 2
      })

      const idUserUpdated = await AuthRepository.updateRecoveryPassInfo(user._id, confirmationCode, expirationDate)
      if (!idUserUpdated) return false

      try {
        await emailAdapter.sendEmail(email, 'Confirm password recovery', generateConfirmationEmailMessage(user._id.toString(), confirmationCode, 'recoveryCode'))
      } catch (e) {
        console.log('AuthService/sendPassRecoverInstructions', e)
        return false
      }

      return true
    } catch (e) {
      console.log('sendPassRecoverInstructions failed')
      return false
    }
  }

  static async changePassword(newPassword: string, recoveryCode: string): Promise<boolean> {
    try {
      const [userId, code] = recoveryCode.split(' ')
      const user = await AuthRepository.getUserById(userId)
      if (!user) return false

      const dateUser = user.passwordRecovery!.expirationDate as Date
      const isExpire = isBefore(dateUser, new Date())

      if (code !== user.passwordRecovery!.recoveryCode || isExpire) {
        return false
      }

      const newHash = await BcryptService.generateHash(newPassword)
      const updatedAt = new Date().toISOString()

      return AuthRepository.updateUserHash(user._id, newHash, updatedAt)
    } catch (e) {
      console.log('changePassword failed')
      return false
    }
  }
}