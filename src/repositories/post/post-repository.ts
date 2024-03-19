import {PostDb} from "../../models/post-models/db/post-db";
import {ObjectId} from "mongodb";
import {UpdatePostModel} from "../../models/post-models/input/update-post-model";
import {PostModel} from "./post-schema";
import {LikesStatuses} from "../../models/comment-models/db/comment-db";
import {LikePostStatusesModel} from "./like-post-statuses-schema";
import {changeLikeStatus} from "../comment/comment-repository";

export class PostRepository {
  static async getPostById(id: string): Promise<PostDb | null> {
    try {
      return PostModel.findOne({_id: new ObjectId(id)}).lean()
    } catch (e) {
      return null
    }
  }

  static async createPost(createdData: PostDb): Promise<string | null> {
    try {
      const post = new PostModel(createdData)
      await post.save()

      return post._id.toString()
    } catch (e) {
      return null
    }
  }

  static async updatePost(id: string, updatedData: UpdatePostModel): Promise<boolean> {
    try {
      const post = await PostModel.findOne({_id: new ObjectId(id)})
      if (!post) return false

      post.title = updatedData.title
      post.shortDescription = updatedData.shortDescription
      post.content = updatedData.content
      post.blogId = updatedData.blogId

      await post.save()

      return true
    } catch (e) {
      return false
    }
  }

  static async deletePost(id: string): Promise<boolean> {
    try {
      const post = await PostModel.findOne({_id: new ObjectId(id)})
      if (!post) return false

      const res = await post.deleteOne()

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }

  static async getUserLikePostStatus(userId: string, postId: string): Promise<LikesStatuses | null> {
    try {
      const currentLikeStatus = await LikePostStatusesModel.findOne({userId, postId}).lean()
      if (!currentLikeStatus) return null

      return currentLikeStatus.likeStatus
    } catch (e) {
      console.log('getUserLikePostStatus repo error', e)
      return null
    }
  }

  static async updatePostLikeStatuses(id: string, likeStatus: LikesStatuses, prevLikeStatus: string): Promise<boolean> {
    try {
      const post = await PostModel.findOne({_id: id})
      if (!post) return false

      changeLikeStatus(post.extendedLikesInfo, likeStatus, prevLikeStatus)

      await post.save()

      return true
    } catch (e) {
      console.log('updatePostLikeStatuses repo error', e)
      return false
    }
  }

  static async putUserPostLikeStatusInDB(userId: string, postId: string, likeStatus: LikesStatuses, login: string): Promise<LikesStatuses | null> {
    try {
      const res = new LikePostStatusesModel({userId, postId, likeStatus, addedAt: new Date().toISOString(), login: login})

      await res.save()

      return res.likeStatus
    } catch (e) {
      console.log('putUserPostLikeStatusInDB repo error', e)
      return null
    }
  }

  static async changeUserPostLikeStatusInDB(userId: string, postId: string, likeStatus: LikesStatuses): Promise<boolean> {
    try {
      const updatedStatus = await LikePostStatusesModel.findOneAndUpdate({
        userId,
        postId
      }, {likeStatus: likeStatus}).lean()

      if (!updatedStatus) return false

      return true
    } catch (e) {
      console.log('changeUserPostLikeStatusInDB repo error', e)
      return false
    }
  }
}