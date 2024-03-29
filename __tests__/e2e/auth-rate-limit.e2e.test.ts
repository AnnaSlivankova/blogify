import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS} from "../../src/app";
import {req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {emailAdapter} from "../../src/adapters/email-adapter";
import mongoose from "mongoose";
import {AuthService} from "../../src/services/auth-service/auth-service";

describe('AUTH_RATE_LIMIT_E2E', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    SETTINGS.MONGO_URL = mongoServer.getUri()
    await mongoose.connect(SETTINGS.MONGO_URL)
    await req.delete(PATH.TESTING).expect(204)
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await mongoose.connection.close()
  })

  describe('Testing rate limit: STATUS 429', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
      jest.spyOn(emailAdapter, 'sendEmail').mockImplementation(() => Promise.resolve(true))
    })

    it('/login: STATUS 429', async () => {
      const user = await testSeeder.registerConfirmedUser()

      for (let i = 0; i <= 4; i++) {
        await testSeeder.login(user!.login, '1234567')
      }

      await testSeeder.login(user!.login, '1234567', 429)

      const sessions = await testSeeder.getAllDeviceSessions(user!._id.toString())

      expect(sessions!.length).toBe(5)
    })

    it('/registration: STATUS 429', async () => {
      for (let i = 0; i <= 4; i++) {
        await testSeeder.registration('test' + i, i + 'test@gmail.com', '1234567')
      }

      await testSeeder.registration('login', 'email@gmail.com', '1234567', 429)
    })

    it('/registration-confirmation: STATUS 429', async () => {
      const user = await testSeeder.registerUser()

      for (let i = 0; i <= 4; i++) {
        const res = await testSeeder.registerUser()
        await testSeeder.registrationConfirmation(`${res!._id.toString()} ${res!.emailConfirmation!.confirmationCode}`)
      }

      await testSeeder.registrationConfirmation(`${user!._id.toString()} ${user!.emailConfirmation!.confirmationCode}`, 429)
    })

    it('/password-recovery: STATUS 429', async () => {
      const user = await testSeeder.registerUser()

      for (let i = 0; i <= 4; i++) {
        await testSeeder.passwordRecovery(user!.email)
      }

      await testSeeder.passwordRecovery(user!.email, 429)
    })

    it('/new-password: STATUS 429', async () => {
      jest.spyOn(AuthService, 'changePassword').mockImplementation(() => Promise.resolve(true))

      for (let i = 0; i <= 4; i++) {
        await testSeeder.setNewPassword('new_password', 'recovery code')
      }

      await testSeeder.setNewPassword('new_password', 'recovery code', 429)
    })
  })
})