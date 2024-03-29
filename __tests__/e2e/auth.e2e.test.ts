import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS, SETTINGS_REWRITE} from "../../src/app";
import {req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {emailAdapter} from "../../src/adapters/email-adapter";
import {delay} from "../utils/delay";
import {SecurityDevicesService} from "../../src/services/security-devices-service";
import mongoose from 'mongoose'

describe('AUTH_E2E', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    SETTINGS.MONGO_URL = mongoServer.getUri()
    await mongoose.connect(SETTINGS.MONGO_URL)
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    jest.spyOn(emailAdapter, 'sendEmail').mockImplementation(() => Promise.resolve(true))
    jest.spyOn(SecurityDevicesService, 'limitRequestsRate').mockImplementation(() => Promise.resolve(true))
  })

  describe('Testing /login', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should login user with correct creds: STATUS 200', async () => {
      const user = await testSeeder.registerConfirmedUser()

      const res = await req
        .post(PATH.AUTH + '/login')
        .send({loginOrEmail: user!.login, password: '1234567'})
        .expect(200)

      expect(res.body.accessToken).toBeTruthy()
      expect(res.headers['set-cookie']).toBeTruthy()

      const cookiesHeader = res.headers['set-cookie']
      expect(cookiesHeader).toBeTruthy()

      // Проверяем, что в ответе установлена кука refreshToken
      const cookies = Array.isArray(cookiesHeader) ? cookiesHeader : [cookiesHeader]
      const refreshTokenCookie = cookies.find(cookie => cookie.startsWith('refreshToken='))
      expect(refreshTokenCookie).toBeTruthy()
    })

    it('shouldn`t login user with incorrect password: STATUS 401', async () => {
      const user = await testSeeder.registerConfirmedUser()

      const res = await req
        .post(PATH.AUTH + '/login')
        .send({loginOrEmail: user!.login, password: 'incorrect'})
        .expect(401)

      expect(res.body.accessToken).toBeFalsy()
      expect(res.headers['set-cookie']).toBeFalsy()
    })

    it('shouldn`t login user with incorrect loginOrEmail: STATUS 401', async () => {
      await testSeeder.registerConfirmedUser()

      const res = await req
        .post(PATH.AUTH + '/login')
        .send({loginOrEmail: 'incorrect', password: '1234567'})
        .expect(401)

      expect(res.body.accessToken).toBeFalsy()
      expect(res.headers['set-cookie']).toBeFalsy()
    })
  })

  describe('Testing /refresh-token', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should send new refresh and access tokens when refreshToken from cookies is correct: STATUS 200', async () => {
      const {refreshToken, accessToken} = await testSeeder.loginUser()
      await delay(1000)

      const res = await req
        .post(PATH.AUTH + '/refresh-token')
        .set('Cookie', refreshToken)
        .expect(200)

      expect(res.body.accessToken).toBeTruthy()
      expect(res.headers['set-cookie']).toBeTruthy()
      expect(res.headers['set-cookie']).not.toStrictEqual(refreshToken)
      expect(res.body.accessToken).not.toStrictEqual(accessToken)
    })

    it('shouldn`t send new refresh and access tokens when refreshToken in cookies is incorrect: STATUS 401', async () => {
      await testSeeder.loginUser()

      const res = await req
        .post(PATH.AUTH + '/refresh-token')
        .set('Cookie', 'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjhmYTE2M2I3LWRhNDktNDZlYi05YzIwLTVhZDVlMmVhOTAzOCIsInVzZXJJZCI6IjY1ZDc1MWFlNDU2OTA5MWE1MGVlNmZmMSIsImlhdCI6MTcwODYwOTk2NiwiZXhwIjoxNzEwMzM3OTY2fQ.4gkxMGIh3zUMJi9Qx36FC5RPGQJOxJsq6CLE3Ohxa1Y')
        .expect(401)

      expect(res.body.accessToken).toBeFalsy()
      expect(res.headers['set-cookie']).toBeFalsy()
    })
  })

  describe('Testing /logout', () => {
    beforeAll(() => {
      SETTINGS_REWRITE.REFRESH_EXP_TOKEN_TIME = '13s'
    })

    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should logout user when refreshToken from cookies is correct and invalidate refreshToken: STATUS 204', async () => {
      const {refreshToken} = await testSeeder.loginUser()

      const res = await req
        .post(PATH.AUTH + '/logout')
        .set('Cookie', refreshToken)
        .expect(204)

      expect(res.headers['set-cookie']).toBeFalsy()

      await req
        .post(PATH.AUTH + '/refresh-token')
        .set('Cookie', refreshToken)
        .expect(401)
    })

    it('shouldn`t logout user when refreshToken from cookies is incorrect: STATUS 401', async () => {
      const {refreshToken} = await testSeeder.loginUser()
      await delay(15000)

      await req
        .post(PATH.AUTH + '/logout')
        .set('Cookie', refreshToken)
        .expect(401)
    })
  })

  describe('Testing /me', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should send user data with correct creds: STATUS 200', async () => {
      const {accessToken} = await testSeeder.loginUser()
      const res = await req
        .get(PATH.AUTH + '/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(res.body).toBeTruthy()
      expect(res.body.email).toBeTruthy()
      expect(res.body.login).toBeTruthy()
      expect(res.body.userId).toBeTruthy()
    })

    it('shouldn`t send user data when accessToken was expired: STATUS 401', async () => {
      const {accessToken} = await testSeeder.loginUser()

      await delay(11000)

      await req
        .get(PATH.AUTH + '/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401)
    })

    it('shouldn`t send user data when accessToken is incorrect: STATUS 401', async () => {
      await testSeeder.loginUser()

      await req
        .get(PATH.AUTH + '/me')
        .set('Authorization', `Bearer invalid.token`)
        .expect(401)
    })
  })

  describe('Testing /registration', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should register user: STATUS 204', async () => {
      await req
        .post(PATH.AUTH + '/registration')
        .send(testSeeder.createUserDto())
        .expect(204)

      const users = await testSeeder.getAllUsersFromDb()
      expect(users.items.length).toBe(1)
    })

    it('shouldn`t register user with credentials with already in db: STATUS 400', async () => {
      await testSeeder.createUserDtoInDb()

      await req
        .post(PATH.AUTH + '/registration')
        .send(testSeeder.createUserDto())
        .expect(400)

      const users = await testSeeder.getAllUsersFromDb()
      expect(users.items.length).toBe(1)
    })

    it('shouldn`t register user with invalid credentials: STATUS 400', async () => {
      const {login, password} = testSeeder.createUserDto()

      const res = await req
        .post(PATH.AUTH + '/registration')
        .send({login, password, email: 'invalid'})
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('email')

      const users = await testSeeder.getAllUsersFromDb()
      expect(users.items.length).toBe(0)
    })
  })

  describe('Testing /registration-confirmation', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should confirm email with correct code, set isConfirmed=true: STATUS 204', async () => {
      const user = await testSeeder.registerUser()
      const code = `${user!._id.toString()} ${user!.emailConfirmation!.confirmationCode!}`

      await req
        .post(PATH.AUTH + '/registration-confirmation')
        .send({code})
        .expect(204)

      const userFromDb = await testSeeder.getUserFromDb(user!._id)
      expect(userFromDb!.emailConfirmation!.isConfirmed).toBe(true)
    })

    it('shouldn`t confirm email with incorrect code: STATUS 400', async () => {
      const user = await testSeeder.registerUser()
      const code = 'incorrect code'

      await req
        .post(PATH.AUTH + '/registration-confirmation')
        .send({code})
        .expect(400)

      const userFromDb = await testSeeder.getUserFromDb(user!._id)
      expect(userFromDb!.emailConfirmation!.isConfirmed).toBe(false)
    })
  })

  describe('Testing /registration-email-resending', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should resend new code when email is correct and user with this email exists in db: STATUS 204', async () => {
      const user = await testSeeder.registerUser()

      await req
        .post(PATH.AUTH + '/registration-email-resending')
        .send({email: user!.email})
        .expect(204)

      const userFromDb = await testSeeder.getUserFromDb(user!._id)
      expect(userFromDb!.emailConfirmation!.isConfirmed).toBeFalsy()
    })

    it('shouldn`t resend new code when email is incorrect: STATUS 400', async () => {
      const user = await testSeeder.registerUser()

      const res = await req
        .post(PATH.AUTH + '/registration-email-resending')
        .send({email: 'incorrect'})
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('email')

      const userFromDb = await testSeeder.getUserFromDb(user!._id)
      expect(userFromDb!.emailConfirmation!.isConfirmed).toBeFalsy()
    })

    it('shouldn`t resend new code when email not found in DB: STATUS 400', async () => {
      const user = await testSeeder.registerUser()

      const res = await req
        .post(PATH.AUTH + '/registration-email-resending')
        .send({email: '404@gmail.com'})
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('email')
      expect(res.body.errorsMessages[0].message).toBe('email is already confirmed')

      const userFromDb = await testSeeder.getUserFromDb(user!._id)
      expect(userFromDb!.emailConfirmation!.isConfirmed).toBeFalsy()
    })

    it('shouldn`t resend new code when email is already confirmed: STATUS 400', async () => {
      const user = await testSeeder.registerConfirmedUser()

      const res = await req
        .post(PATH.AUTH + '/registration-email-resending')
        .send({email: user!.email})
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('email')
      expect(res.body.errorsMessages[0].message).toBe('email is already confirmed')
    })
  })

  describe('Testing /password-recovery', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should send recoveryCode to registered email: STATUS 204', async () => {
      const user = await testSeeder.registerUser()

      await req
        .post(PATH.AUTH + '/password-recovery')
        .send({email: user!.email})
        .expect(204)
    })

    it('should send recoveryCode to email even if current email is not registered: STATUS 204', async () => {
      await req
        .post(PATH.AUTH + '/password-recovery')
        .send({email: 'unregisterEmail@gmail.com'})
        .expect(204)
    })

    it('shouldn`t send recoveryCode when input data is incorrect: STATUS 400', async () => {
      await testSeeder.registerUser()

      const res = await req
        .post(PATH.AUTH + '/password-recovery')
        .send({email: 'invalidEmail$gmail.com'})
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('email')
    })
  })

  describe('Testing /new-password', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should change user password with correct newPassword and valid recoveryCode: STATUS 204', async () => {
      const {userId, passwordRecoveryInfo} = await testSeeder.requestUserPasswordRecovery()

      await req
        .post(PATH.AUTH + '/new-password')
        .send({newPassword: 'new_password', recoveryCode: userId + ' ' + passwordRecoveryInfo.recoveryCode })
        .expect(204)
    })

    it('shouldn`t change user password with incorrect input data: STATUS 400', async () => {
      const {userId, passwordRecoveryInfo} = await testSeeder.requestUserPasswordRecovery()

    const res =   await req
        .post(PATH.AUTH + '/new-password')
        .send({newPassword: 'small', recoveryCode: userId + ' ' + passwordRecoveryInfo.recoveryCode })
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('newPassword')
    })

    it('shouldn`t change user password with valid recoveryCode: STATUS 400', async () => {
      const {userId, passwordRecoveryInfo} = await testSeeder.requestUserPasswordRecovery()

      const res =   await req
        .post(PATH.AUTH + '/new-password')
        .send({newPassword: 'new_password', recoveryCode: userId + ' ' + passwordRecoveryInfo.recoveryCode + 'i' })
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('recoveryCode')
    })
  })
})