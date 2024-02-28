import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS} from "../../src/app";
import {MongoClient} from "mongodb";
import {req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {delay} from "../utils/delay";
import {SecurityDevicesService} from "../../src/services/security-devices-service";

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

  beforeEach(async () => {
    jest.spyOn(SecurityDevicesService, 'limitRequestsRate').mockImplementation(() => Promise.resolve(true))
  })

  describe('/posts/:id/comments', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should create comment to a post: STATUS 201', async () => {
      const [{accessToken}, postId] = await Promise.all([
        testSeeder.loginUser(),
        testSeeder.createBlogWithPostInDb()
      ])

      const res = await req
        .post(`${PATH.POSTS}/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'some tests comment 20'}
        )
        .expect(201)

      expect(res.body).toBeDefined()
      expect(res.body.id).toBeDefined()
      expect(res.body.content).toStrictEqual('some tests comment 20')
      expect(res.body.commentatorInfo.userId).toBeTruthy()
      expect(res.body.commentatorInfo.userLogin).toBeTruthy()
      expect(res.body.createdAt).toBeTruthy()

      const commentsDB = await testSeeder.getAllComments(postId)
      expect(commentsDB.items.length).toBe(1)
    })

    it('shouldn`t create comment to a post with invalid input data: STATUS 400', async () => {
      const [{accessToken}, postId] = await Promise.all([
        testSeeder.loginUser(),
        testSeeder.createBlogWithPostInDb()
      ])

      const res = await req
        .post(`${PATH.POSTS}/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'comment less 20 sym'}
        )
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('content')

      const commentsDB = await testSeeder.getAllComments(postId)
      expect(commentsDB.items.length).toBe(0)
    })

    it('shouldn`t create comment to a post with expired token: STATUS 401', async () => {
      const [{accessToken}, postId] = await Promise.all([
        testSeeder.loginUser(),
        testSeeder.createBlogWithPostInDb()
      ])

      await delay(11000)

      await req
        .post(`${PATH.POSTS}/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'some tests comment 20'}
        )
        .expect(401)

      const commentsDB = await testSeeder.getAllComments(postId)
      expect(commentsDB.items.length).toBe(0)
    })

    it('shouldn`t create comment to a post with invalid creds: STATUS 401', async () => {
      const [_, postId] = await Promise.all([
        testSeeder.loginUser(),
        testSeeder.createBlogWithPostInDb()
      ])

      await req
        .post(`${PATH.POSTS}/${postId}/comments`)
        .set('Authorization', `Bearer invalid.token`)
        .send({content: 'some tests comment 20'}
        )
        .expect(401)

      const commentsDB = await testSeeder.getAllComments(postId)
      expect(commentsDB.items.length).toBe(0)
    })

    it('shouldn`t create comment to a post with invalid postId: STATUS 404', async () => {
      const [{accessToken}, postId] = await Promise.all([
        testSeeder.loginUser(),
        testSeeder.createBlogWithPostInDb()
      ])

      await req
        .post(`${PATH.POSTS}/postId/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'some tests comment 20'}
        )
        .expect(404)

      const commentsDB = await testSeeder.getAllComments(postId)
      expect(commentsDB.items.length).toBe(0)
    })

  })

  describe('GET request with query params /posts/:id/comments', () => {
    let postId: string

    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
      const {id} = await testSeeder.createCommentsInDb(23)
      postId = id
    })

    it('GET should return array with 10 items and pageCount 3', async () => {
      const res = await req.get(`${PATH.POSTS}/${postId}/comments`).expect(200)

      expect(res.body.items.length).toBe(10)
      expect(res.body.items[0].content).toBe('comment more than 20 sym23')
      expect(res.body.pagesCount).toBe(3)
    })

    it('GET should return array with 20 items/pageCount 2/name:1name', async () => {
      const res = await req.get(`${PATH.POSTS}/${postId}/comments`).query({
        sortDirection: 'asc',
        pageSize: 20
      }).expect(200)

      expect(res.body.items.length).toBe(20)
      expect(res.body.items[0].content).toBe('comment more than 20 sym0')
      expect(res.body.pageSize).toBe(20)
      expect(res.body.pagesCount).toBe(2)
    })
  })

  describe('/comments/:id', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('should update comment to a post: STATUS 204', async () => {
      const {accessToken, comment} = await testSeeder.createCommentInDb()

      await req
        .put(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'updated comment more 20sym'}
        )
        .expect(204)
    })

    it('shouldn`t update comment to a post with invalid input data: STATUS 400', async () => {
      const {accessToken, comment} = await testSeeder.createCommentInDb()

      const res = await req
        .put(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'comment less 20 sym'})
        .expect(400)

      expect(res.body.errorsMessages.length).toBe(1)
      expect(res.body.errorsMessages[0].field).toBe('content')
    })

    it('shouldn`t update comment to a post with expired token: STATUS 401', async () => {
      const {accessToken, comment} = await testSeeder.createCommentInDb()

      await delay(11000)

      await req
        .put(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'updated comment more 20sym'}
        )
        .expect(401)
    })

    it('shouldn`t update comment to a post with invalid creds: STATUS 401', async () => {
      const {comment} = await testSeeder.createCommentInDb()

      await req
        .put(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer invalid.token`)
        .send({content: 'updated comment more 20sym'}
        )
        .expect(401)
    })

    it('shouldn`t update comment to a post with invalid postId: STATUS 404', async () => {
      const {accessToken} = await testSeeder.createCommentInDb()

      await req
        .put(`${PATH.COMMENTS}/commentId`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'updated comment more 20sym'}
        )
        .expect(404)
    })

    it('shouldn`t update someone else`s comment: STATUS 403', async () => {
      const users = await testSeeder.registerConfirmedUsers(2)
      const {comment} = await testSeeder.createCommentInDb()

      const res = await req
        .post(PATH.AUTH + '/login')
        .send({loginOrEmail: users![0].login, password: '1234567'})
        .expect(200)

      const accessToken = res.body.accessToken

      await req
        .put(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({content: 'updated comment more 20sym'}
        )
        .expect(403)
    })

    it('should delete user`s comment: STATUS 204', async () => {
      const {accessToken, comment} = await testSeeder.createCommentInDb()

      await req
        .delete(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204)
    })

    it('shouldn`t delete user`s comment with expired token: STATUS 401', async () => {
      const {accessToken, comment} = await testSeeder.createCommentInDb()

      await delay(11000)

      await req
        .delete(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401)
    })

    it('shouldn`t delete user`s comment with invalid creds: STATUS 401', async () => {
      const {comment} = await testSeeder.createCommentInDb()

      await req
        .delete(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer invalid.token`)
        .expect(401)
    })

    it('shouldn`t delete user`s comment with invalid postId: STATUS 404', async () => {
      const {accessToken} = await testSeeder.createCommentInDb()

      await req
        .delete(`${PATH.COMMENTS}/commentId`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
    })

    it('shouldn`t delete someone else`s comment: STATUS 403', async () => {
      const users = await testSeeder.registerConfirmedUsers(2)
      const {comment} = await testSeeder.createCommentInDb()

      const res = await req
        .post(PATH.AUTH + '/login')
        .send({loginOrEmail: users![0].login, password: '1234567'})
        .expect(200)

      const accessToken = res.body.accessToken

      await req
        .delete(`${PATH.COMMENTS}/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403)
    })

    it('should return user`s comment by id: STATUS 200', async () => {
      const {comment} = await testSeeder.createCommentInDb()

      const res = await req
        .get(`${PATH.COMMENTS}/${comment.id}`)
        .expect(200)

      expect(res.body.id).toStrictEqual(comment.id)
      expect(res.body.content).toStrictEqual(comment.content)
      expect(res.body.commentatorInfo.userId).toBeTruthy()
      expect(res.body.commentatorInfo.userLogin).toBeTruthy()
      expect(res.body.createdAt).toBeTruthy()
    })

    it('shouldn`t return user`s comment with invalid postId: STATUS 404', async () => {
      await testSeeder.createCommentInDb()

      await req
        .get(`${PATH.COMMENTS}/commentId`)
        .expect(404)
    })
  })
})