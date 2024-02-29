import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS} from "../../src/app";
import {commonHeaders, req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {SecurityDevicesService} from "../../src/services/security-devices-service";
import mongoose from "mongoose";

describe('USERS_E2E', () => {
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
    jest.spyOn(SecurityDevicesService, 'limitRequestsRate').mockImplementation(() => Promise.resolve(true))
  })

  describe('Testing users CRUDS', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('shouldn`t create user without authorization: STATUS 401', async () => {
      await req
        .post(PATH.USERS)
        .send()
        .expect(401)
    })

    it('should create user with correct data and return it: STATUS 201', async () => {
      const userDto = testSeeder.createUserDto()

      const res = await req
        .post(PATH.USERS)
        .auth(SETTINGS.LOGIN_CRED, SETTINGS.PASS_CRED, {type: 'basic'})
        .send(userDto)
        .expect(201)

      expect(res.body).toBeTruthy()
    })

    it('should`n create user with incorrect data and return errorsMessages[]: STATUS 400', async () => {
      const userDto = testSeeder.createUserDto()

      const res = await req
        .post(PATH.USERS)
        .auth(SETTINGS.LOGIN_CRED, SETTINGS.PASS_CRED, {type: 'basic'})
        .send({...userDto, email: 'invalid'})
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
    })

    it('shouldn`t delete user without authorization: STATUS 401', async () => {
      const user = await testSeeder.createUserDtoInDb()

      await req
        .delete(`${PATH.USERS}/${user.id}`)
        .expect(401)
    })

    it('shouldn`t delete user with incorrect id: STATUS 404', async () => {
      await req
        .delete(`${PATH.USERS}/incorrectId`)
        .set(commonHeaders)
        .expect(404)
    })

    it('should delete user by id: STATUS 204', async () => {
      const user = await testSeeder.createUserDtoInDb()

      await req
        .delete(`${PATH.USERS}/${user.id}`)
        .set(commonHeaders)
        .expect(204)
    })
  })

  describe('GET request with query params', () => {
    beforeAll(async () => {
      await testSeeder.createUsersDtosInDb(15)
    })

    it('should not return users[] without authorization: STATUS 401', async () => {
      await req
        .get(PATH.USERS)
        .expect(401)
    })

    it('should return users[] with 10 items, pagesCount to be 2: STATUS 200', async () => {
      const res = await req
        .get(PATH.USERS)
        .set(commonHeaders)
        .expect(200)

      expect(res.body.pagesCount).toBe(2)
      expect(res.body.pageSize).toBe(10)
      expect(res.body.items.length).toBe(10)
    })

    it('should return users[] with 5 items, pagesCount to be 2, page to be 2: STATUS 200', async () => {
      const res = await req
        .get(PATH.USERS)
        .query({pageNumber: 2})
        .set(commonHeaders)
        .expect(200)

      expect(res.body.pagesCount).toBe(2)
      expect(res.body.page).toBe(2)
      expect(res.body.items.length).toBe(5)
    })
  })
})