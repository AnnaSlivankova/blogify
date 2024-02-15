import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS} from "../../src/app";
import {MongoClient} from "mongodb";
import {commonHeaders, req} from "./utils/tests-settings";
import {testingDtosCreator} from "./utils/testingDtosCreator";
import {createUserDto, createUsersDtos} from "./utils/createUsers";

describe('USERS_TESTS', () => {
  let client: MongoClient

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    SETTINGS.MONGO_URL = mongoServer.getUri()
    client = new MongoClient(SETTINGS.MONGO_URL)
    await client.connect()
  })

  beforeEach(async () => {
    await req.delete(PATH.TESTING).expect(204)
  })

  afterAll(async () => {
    await client.close()
  })

  it('shouldn`t create user without authorization: STATUS 401', async () => {
    await req
      .post(PATH.USERS)
      .send()
      .expect(401)
  })

  it('should create user with correct data and return it: STATUS 201', async () => {
    const userDto = testingDtosCreator.createUserDto()

    const res = await req
      .post(PATH.USERS)
      .auth(SETTINGS.LOGIN_CRED, SETTINGS.PASS_CRED, {type: 'basic'})
      .send(userDto)
      .expect(201)

    expect(res.body).toBeTruthy()
  })

  it('should`n create user with incorrect data and return errorsMessages[]: STATUS 400', async () => {
    const userDto = testingDtosCreator.createUserDto()

    const res = await req
      .post(PATH.USERS)
      .auth(SETTINGS.LOGIN_CRED, SETTINGS.PASS_CRED, {type: 'basic'})
      .send({...userDto, email: 'invalid'})
      .expect(400)

    expect(res.body.errorsMessages.length).toBe(1)
  })

  it('shouldn`t delete user without authorization: STATUS 401', async () => {
    const user = await createUserDto()

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
    const user = await createUserDto()

    await req
      .delete(`${PATH.USERS}/${user.id}`)
      .set(commonHeaders)
      .expect(204)
  })

  describe('GET USERS', () => {
    beforeEach(async () => {
      await createUsersDtos(15)
    })

    it('should return users[] without authorization: STATUS 401', async () => {
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