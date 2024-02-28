import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS, SETTINGS_REWRITE} from "../../src/app";
import {MongoClient} from "mongodb";
import {req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {delay} from "../utils/delay";
import {SecurityDevicesService} from "../../src/services/security-devices-service";

describe('SECURITY-DEVICES_E2E', () => {
  let client: MongoClient

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    SETTINGS.MONGO_URL = mongoServer.getUri()
    client = new MongoClient(SETTINGS.MONGO_URL)
    await client.connect()
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await client.close()
  })

  beforeEach(async () => {
    jest.spyOn(SecurityDevicesService, 'limitRequestsRate').mockImplementation(() => Promise.resolve(true))
  })

  describe('Testing /security/devices', () => {
    beforeAll(() => {
      SETTINGS_REWRITE.REFRESH_EXP_TOKEN_TIME = '13s'
    })

    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)

    })

    it('should return all device sessions data: STATUS 200', async () => {
      const {refreshToken} = await testSeeder.loginFrom4DifDevices()

      const res = await req
        .get(`${PATH.SECURITY}/devices`)
        .set('Cookie', refreshToken)
        .expect(200)

      expect(res.body.length).toBe(6)
      expect(res.body).toBeDefined()
    })

    it('should delete all device sessions except current: STATUS 204', async () => {
      const {refreshToken, userId} = await testSeeder.loginFrom4DifDevices()

      await req
        .delete(`${PATH.SECURITY}/devices`)
        .set('Cookie', refreshToken)
        .expect(204)

      const sessions = await testSeeder.getAllDeviceSessions(userId!.toString())

      expect(sessions!.length).toBe(1)
    })

    it('shouldn`t delete sessions if token was expired: STATUS 401', async () => {
      const {refreshToken, userId} = await testSeeder.loginFrom4DifDevices()
      await delay(15000)

      await req
        .delete(`${PATH.SECURITY}/devices`)
        .set('Cookie', refreshToken)
        .expect(401)

      const sessions = await testSeeder.getAllDeviceSessions(userId!.toString())

      expect(sessions!.length).toBe(6)
    })

    it('shouldn`t delete sessions with incorrect token: STATUS 401', async () => {
      const {userId} = await testSeeder.loginFrom4DifDevices()

      await req
        .delete(`${PATH.SECURITY}/devices`)
        .set('Cookie', 'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjhmYTE2M2I3LWRhNDktNDZlYi05YzIwLTVhZDVlMmVhOTAzOCIsInVzZXJJZCI6IjY1ZDc1MWFlNDU2OTA5MWE1MGVlNmZmMSIsImlhdCI6MTcwODYwOTk2NiwiZXhwIjoxNzEwMzM3OTY2fQ.4gkxMGIh3zUMJi9Qx36FC5RPGQJOxJsq6CLE3Ohxa1Y')
        .expect(401)

      const sessions = await testSeeder.getAllDeviceSessions(userId!.toString())

      expect(sessions!.length).toBe(6)
    })

    it('should delete device session by id: STATUS 204', async () => {
      const {refreshToken, userId} = await testSeeder.loginFrom4DifDevices()
      const sessions = await testSeeder.getAllDeviceSessions(userId!.toString())

      await req
        .delete(`${PATH.SECURITY}/devices/${sessions![0].deviceId}`)
        .set('Cookie', refreshToken)
        .expect(204)

      const res = await testSeeder.getAllDeviceSessions(userId!.toString())

      expect(res!.length).toBe(5)
    })

    it('shouldn`t delete device session by id if token was expired: STATUS 401', async () => {
      const {refreshToken, userId} = await testSeeder.loginFrom4DifDevices()
      const sessions = await testSeeder.getAllDeviceSessions(userId!.toString())
      await delay(15000)

      await req
        .delete(`${PATH.SECURITY}/devices/${sessions![0].deviceId}`)
        .set('Cookie', refreshToken)
        .expect(401)

      const res = await testSeeder.getAllDeviceSessions(userId!.toString())

      expect(res!.length).toBe(6)
    })

    it('shouldn`t delete device session by id with incorrect token: STATUS 401', async () => {
      const {userId} = await testSeeder.loginFrom4DifDevices()
      const sessions = await testSeeder.getAllDeviceSessions(userId!.toString())

      await req
        .delete(`${PATH.SECURITY}/devices/${sessions![0].deviceId}`)
        .set('Cookie', 'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjhmYTE2M2I3LWRhNDktNDZlYi05YzIwLTVhZDVlMmVhOTAzOCIsInVzZXJJZCI6IjY1ZDc1MWFlNDU2OTA5MWE1MGVlNmZmMSIsImlhdCI6MTcwODYwOTk2NiwiZXhwIjoxNzEwMzM3OTY2fQ.4gkxMGIh3zUMJi9Qx36FC5RPGQJOxJsq6CLE3Ohxa1Y')
        .expect(401)

      const res = await testSeeder.getAllDeviceSessions(userId!.toString())

      expect(res!.length).toBe(6)
    })

    it('shouldn`t delete device session by id with invalid id: STATUS 404', async () => {
      const {userId, refreshToken} = await testSeeder.loginFrom4DifDevices()

      await req
        .delete(`${PATH.SECURITY}/devices/deviceId}`)
        .set('Cookie', refreshToken)
        .expect(404)

      const res = await testSeeder.getAllDeviceSessions(userId!.toString())

      expect(res!.length).toBe(6)
    })
  })
})