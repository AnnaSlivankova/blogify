import {AuthRepository} from "../../repositories/auth-repository";
import {BcryptService} from "../bcrypt-service";
import {JwtService} from "../jwt-service";
import {LoginOutputModel} from "../../models/auth-models/output/login-output-model";
import {RegistrationInputModel} from "../../models/auth-models/input/registration-input-model";
import {UserDb} from "../../models/user-models/db/user-db";
import {UserRepository} from "../../repositories/user-repository";
import {emailAdapter} from "../../adapters/email-adapter";
import {v4 as uuidv4} from 'uuid';
import {add, isBefore} from "date-fns";
import {ObjectId, WithId} from "mongodb";
import {generateConfirmationEmail} from "./generate-confirmation-email";
import {UserService} from "../user-service";

export class AuthService {
  static async login(loginOrEmail: string, password: string): Promise<null | LoginOutputModel & {
    refreshToken: string
  }> {
    const user = await AuthRepository.getSearchedUser(loginOrEmail)
    if (!user) return null

    const isPassValid = await BcryptService.compareHashes(password, user.hash)
    if (!isPassValid) return null

    const accessToken = await JwtService.createJWT(user, '10s')
    const refreshToken = await JwtService.createJWT(user, '20s')

    return {accessToken, refreshToken}
  }

  static async refreshTokens(oldRefreshToken: string, userId: ObjectId): Promise<null | LoginOutputModel & {
    refreshToken: string
  }> {
    const [isAlreadyInBlackList, isOldTokenInBlackList, user] = await Promise.all([
      AuthRepository.findRefreshTokenInBlackList(oldRefreshToken),
      AuthRepository.putTokenInBlackList(oldRefreshToken),
      UserService.getUserById(userId)
    ]);

    if (isAlreadyInBlackList || !isOldTokenInBlackList || !user) {
      return null;
    }

    const accessToken = await JwtService.createJWT(user, '10s')
    const refreshToken = await JwtService.createJWT(user, '20s')

    return {accessToken, refreshToken}
  }

  static async logout(token: string): Promise<boolean> {
    const isAlreadyInBlackList = await AuthRepository.findRefreshTokenInBlackList(token)
    if (isAlreadyInBlackList) return false

    return await AuthRepository.putTokenInBlackList(token)
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
        expirationDare: add(new Date(), {
          hours: 1,
          minutes: 2
        }),
        isConfirmed: false
      }
    }

    const createdUser = await AuthRepository.createUser(newUser)

    if (!createdUser) return null

    try {
      await emailAdapter.sendEmail(email, 'Confirm registration', generateConfirmationEmail(createdUser!._id.toString(), createdUser.emailConfirmation!.confirmationCode!))
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

    const dateUser = user.emailConfirmation!.expirationDare as Date

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
      await emailAdapter.sendEmail(email, 'Confirm registration', generateConfirmationEmail(user._id.toString(), newCode))
    } catch (e) {
      console.log('AuthService/register', e)
      return false
    }

    return true
  }
}