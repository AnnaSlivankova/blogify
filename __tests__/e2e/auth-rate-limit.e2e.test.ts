import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS, SETTINGS_REWRITE} from "../../src/app";
import {MongoClient} from "mongodb";
import {req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {emailAdapter} from "../../src/adapters/email-adapter";
import {delay} from "../utils/delay";
import {SecurityDevicesService} from "../../src/services/security-devices-service";

describe('AUTH_RATE_LIMIT_E2E', () => {
  let client: MongoClient

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    SETTINGS.MONGO_URL = mongoServer.getUri()
    client = new MongoClient(SETTINGS.MONGO_URL)
    await client.connect()
    await req.delete(PATH.TESTING).expect(204)
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await client.close()
  })

  // beforeEach(async () => {
  //   jest.spyOn(emailAdapter, 'sendEmail').mockImplementation(() => Promise.resolve(true))
  // })

  describe('Testing rate limit: STATUS 429', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
      jest.spyOn(emailAdapter, 'sendEmail').mockImplementation(() => Promise.resolve(true))
    })

    it('/login: STATUS 429', async () => {
      const user = await testSeeder.registerConfirmedUser()

      for (let i = 0; i < 4; i++) {
        // console.log('tik', i)
        await testSeeder.login(user!.login, '1234567')
        // await delay(20)
        console.log('tik', i)
      }

      await testSeeder.login(user!.login, '1234567', 429)

      const sessions = await testSeeder.getAllDeviceSessions(user!._id.toString())

      expect(sessions!.length).toBe(4)
    })

    it('/registration: STATUS 429', async () => {
      for (let i = 0; i < 5; i++) {
        await testSeeder.registration('test' + i, i + 'test@gmail.com', '1234567')
      }

      await testSeeder.registration('login', 'email@gmail.com', '1234567', 429)
    })

    it('/registration-confirmation: STATUS 429', async () => {
      const user = await testSeeder.registerUser()

      for (let i = 0; i < 5; i++) {
        const res = await testSeeder.registerUser()
        await testSeeder.registrationConfirmation(`${res!._id.toString()} ${res!.emailConfirmation!.confirmationCode}`)
      }

      await testSeeder.registrationConfirmation(`${user!._id.toString()} ${user!.emailConfirmation!.confirmationCode}`, 429)
    })
  })
})