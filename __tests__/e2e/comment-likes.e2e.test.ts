import {MongoMemoryServer} from "mongodb-memory-server";
import {PATH, SETTINGS} from "../../src/app";
import {req} from "../tests-settings";
import {testSeeder} from "../test.seeder";
import {SecurityDevicesService} from "../../src/services/security-devices-service";
import mongoose from "mongoose";
import {LikesStatuses} from "../../src/models/comment-models/db/comment-db";
import {emailAdapter} from "../../src/adapters/email-adapter";

describe('COMMENTS_E2E', () => {
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

    jest.spyOn(emailAdapter, 'sendEmail').mockImplementation(() => Promise.resolve(true))
  })


  describe('/comments/:id/like-status', () => {
    beforeEach(async () => {
      await req.delete(PATH.TESTING).expect(204)
    })

    it('GET should return all post comments with likes/dislikes statuses and myStatus: None for no-logged in user', async () => {
      const {postId} = await testSeeder.createCommentInDb()
      const postComments = await testSeeder.getAllComments(postId)

      expect(postComments.items.length).toBe(1)
      expect(postComments.items[0].likesInfo.likesCount).toBe(0)
      expect(postComments.items[0].likesInfo.dislikesCount).toBe(0)
      expect(postComments.items[0].likesInfo.myStatus).toBe(LikesStatuses.NONE)
    })


    it('GET should return all post comments with likes/dislikes statuses and myStatus: None', async () => {
      const {comment, accessToken, postId} = await testSeeder.createCommentInDb()

      console.log('accessToken',accessToken)

      await req
        .put(`${PATH.COMMENTS}/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: LikesStatuses.LIKE})
        .expect(204)

      const postComments = await testSeeder.getAllComments(postId)

      expect(postComments.items.length).toBe(1)
      expect(postComments.items[0].likesInfo.likesCount).toBe(1)
      expect(postComments.items[0].likesInfo.dislikesCount).toBe(0)
      expect(postComments.items[0].likesInfo.myStatus).toBe(LikesStatuses.NONE)
    })

    it('GET should return ...2', async () => {
      await testSeeder.registration('user1', 'user1@gmail.com', '123456')
      await testSeeder.registration('user2', 'user2@gmail.com', '123456')
      const res1 = await testSeeder.login('user1', '123456')

      const refreshToken = res1.body.accessToken

      const res2 = await testSeeder.login('user2', '123456')

      const postId = await testSeeder.createBlogWithPostInDb()

      const commentRes1 = await testSeeder.createCommentManager(postId, res1.body.accessToken)
      const commentRes2 = await testSeeder.createCommentManager(postId, res1.body.accessToken)

      await req
        .put(`${PATH.COMMENTS}/${commentRes1.body.id}/like-status`)
        .set('Authorization', `Bearer ${res1.body.accessToken}`)
        .send({likeStatus: LikesStatuses.LIKE})
        .expect(204)

      await req
        .put(`${PATH.COMMENTS}/${commentRes1.body.id}/like-status`)
        .set('Authorization', `Bearer ${res2.body.accessToken}`)
        .send({likeStatus: LikesStatuses.DISLIKE})
        .expect(204)


      const postComments = await testSeeder.getAllComments(postId)

      expect(postComments.items.length).toBe(2)
      expect(postComments.items[0].likesInfo.likesCount).toBe(0)
      expect(postComments.items[0].likesInfo.dislikesCount).toBe(0)
      expect(postComments.items[0].likesInfo.myStatus).toBe(LikesStatuses.NONE)

      expect(postComments.items[1].likesInfo.likesCount).toBe(1)
      expect(postComments.items[1].likesInfo.dislikesCount).toBe(1)
      expect(postComments.items[1].likesInfo.myStatus).toBe(LikesStatuses.NONE)


      const postComm = await testSeeder.getAllCommentsCookie(postId, refreshToken)

      expect(postComm.items.length).toBe(2)
      expect(postComm.items[0].likesInfo.likesCount).toBe(0)
      expect(postComm.items[0].likesInfo.dislikesCount).toBe(0)
      expect(postComm.items[0].likesInfo.myStatus).toBe(LikesStatuses.NONE)

      expect(postComm.items[1].likesInfo.likesCount).toBe(1)
      expect(postComm.items[1].likesInfo.dislikesCount).toBe(1)
      expect(postComm.items[1].likesInfo.myStatus).toBe(LikesStatuses.LIKE)


    })
  })

})