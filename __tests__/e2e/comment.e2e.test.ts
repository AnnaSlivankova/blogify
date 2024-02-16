import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS} from "../../src/app";
import {MongoClient} from "mongodb";
import {commonHeaders, req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {BlogViewModel} from "../../src/models/blog-models/output/blog-view-model";
import {PostViewModel} from "../../src/models/post-models/output/post-view-model";

describe('COMMENTS_E2E', () => {
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

  describe('Testing comments CrUDS', () => {
    let blog: BlogViewModel
    let post: PostViewModel
    let token: { accessToken: string }

    beforeAll(async () => {
      blog = await testSeeder.createBlogDtoInDb()
      post = await testSeeder.createPostDtoInDb(blog.id)
      const createdUser = await testSeeder.createUserDtoInDb()
      token = await testSeeder.loginUser('test@gmail.com', '1234567')
    })

    // beforeEach(async () => {
    //   // await req.delete(PATH.TESTING).expect(204)
    // })


    it('shouldn`t create comment when user isn`t authorized: STATUS 401', async () => {
      await req.post(`${PATH.POSTS}/${post.id}/comments`).send({}).expect(401)
    })

    // it('shouldn`t create comment with incorrect input-data: STATUS 400', async () => {
    //   const bt = token.accessToken
    //   const res = await req.post(`${PATH.POSTS}/${post.id}/comments`).set('Autorization', `Bearer ${bt}`).send({}).expect(400)
    //
    //   expect(res.body.errorsMessages.length).toBe(1)
    //   expect(res.body.errorsMessages[0].field).toStrictEqual("content")
    // })
    //
    //
    // it('should create comment and return it: STATUS 201', async () => {
    //   const res = await req.post(`${PATH.POSTS}/${post.id}/comments`).set('Autorization', `Bearer ${token}`).send({content: 'test comment'}).expect(201)
    //
    //   expect(res.body.content).toBeTruthy()
    // })


  })

  // describe('GET USERS', () => {
  //   beforeEach(async () => {
  //     await createUsersDtos(15)
  //   })
  //
  //   it('should return users[] without authorization: STATUS 401', async () => {
  //     await req
  //       .get(PATH.USERS)
  //       .expect(401)
  //   })
  //
  //   it('should return users[] with 10 items, pagesCount to be 2: STATUS 200', async () => {
  //     const res = await req
  //       .get(PATH.USERS)
  //       .set(commonHeaders)
  //       .expect(200)
  //
  //     expect(res.body.pagesCount).toBe(2)
  //     expect(res.body.pageSize).toBe(10)
  //     expect(res.body.items.length).toBe(10)
  //   })
  //
  //   it('should return users[] with 5 items, pagesCount to be 2, page to be 2: STATUS 200', async () => {
  //     const res = await req
  //       .get(PATH.USERS)
  //       .query({pageNumber: 2})
  //       .set(commonHeaders)
  //       .expect(200)
  //
  //     expect(res.body.pagesCount).toBe(2)
  //     expect(res.body.page).toBe(2)
  //     expect(res.body.items.length).toBe(5)
  //   })
  // })
})