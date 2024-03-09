import {CommentDb, LikesStatuses} from "../../models/comment-models/db/comment-db";
import {ObjectId, WithId} from "mongodb";
import {UpdateCommentModel} from "../../models/comment-models/input/update-comment-model";
import {CommentModel} from "./comment-schema";
import {LikeCommentStatusesModel} from "./like-comment-statuses-schema";
import {commentMapper} from "../../models/comment-models/mapper/comment-mapper";

export class CommentRepository {
  static async createComment(createdData: CommentDb): Promise<string | null> {
    try {
      const comment = new CommentModel(createdData)
      const res = await comment.save()

      return res._id.toString()
    } catch (e) {
      return null
    }
  }

  static async updateComment(id: string, updatedData: UpdateCommentModel): Promise<boolean> {
    try {
      const comment = await CommentModel.findOne({_id: new ObjectId(id)})
      if (!comment) return false

      comment.content = updatedData.content

      await comment.save()

      return true
    } catch (e) {
      return false
    }
  }

  static async getCommentById(id: string): Promise<CommentDb | null> {
    try {
      return CommentModel.findOne({_id: new ObjectId(id)}).lean()
    } catch (e) {
      return null
    }
  }

  static async deleteComment(id: string): Promise<boolean> {
    try {
      const comment = await CommentModel.findOne({_id: new ObjectId(id)})
      if (!comment) return false

      const res = await comment.deleteOne()

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }


  static async getAllPostComments(postId: string): Promise<null | WithId<CommentDb>[]> {
    try {
      const comments = await CommentModel.find({postId: postId}).lean()
      if(!comments) return null

      // comments[0]._id

      return comments
    } catch (e) {
      console.log('getAllPostComments repo error')
      return null
    }
  }


  static async putUserCommentLikeStatusInDB(userId: string, commentId: string, likeStatus: LikesStatuses): Promise<LikesStatuses | null> {
    try {
      const res = new LikeCommentStatusesModel({userId, commentId, likeStatus})
      await res.save()

      return res.likeStatus
    } catch (e) {
      console.log('putUserCommentLikeStatusInDB repo error')
      return null
    }
  }

  static async changeUserCommentLikeStatusInDB(userId: string, commentId: string, likeStatus: LikesStatuses): Promise<boolean> {
    try {

      const updatedStatus = await LikeCommentStatusesModel.findOneAndUpdate({
        userId,
        commentId
      }, {likeStatus: likeStatus}).lean()
      if (!updatedStatus) return false

      // const comment = await LikeCommentStatusesModel.findOne({userId, commentId}).lean()
      // if(!comment) return false

      // comment.likeStatus = likeStatus

      // await comment.save()

      return true
    } catch (e) {
      console.log('changeUserCommentLikeStatusInDB repo error')
      return false
    }
  }


  static async getUserLikeCommentStatus(userId: string, commentId: string): Promise<LikesStatuses | null> {
    try {
      const currentLikeStatus = await LikeCommentStatusesModel.findOne({userId, commentId}).lean()
      if (!currentLikeStatus) return null

      return currentLikeStatus.likeStatus
    } catch (e) {
      console.log('getUserLikeCommentStatus repo error')
      return null
    }
  }

  static async getUserLikeCommentsStatuses(userId: string) {
    try {
      const currentLikeStatuses = await LikeCommentStatusesModel.find({userId}).lean()
      if (!currentLikeStatuses.length) return null

      return currentLikeStatuses
    } catch (e) {
      console.log('getUserLikeCommentsStatuses repo error')
      return null
    }
  }


  static async updateCommentLikeStatuses(id: string, likeStatus: LikesStatuses, prevLikeStatus: string): Promise<boolean> {
    try {
      const comment = await CommentModel.findOne({_id: id})
      if (!comment) return false

      if (likeStatus === LikesStatuses.LIKE && likeStatus !== prevLikeStatus) {
        comment.likesInfo.likesCount = comment.likesInfo.likesCount + 1
        console.log('1')

        if (prevLikeStatus === LikesStatuses.DISLIKE) comment.likesInfo.dislikesCount = comment.likesInfo.dislikesCount - 1
      }




      if (likeStatus === LikesStatuses.DISLIKE && likeStatus !== prevLikeStatus) {
        comment.likesInfo.dislikesCount = comment.likesInfo.dislikesCount + 1
        console.log('2')
        if (prevLikeStatus === LikesStatuses.LIKE) comment.likesInfo.likesCount = comment.likesInfo.likesCount - 1
      }




      if (likeStatus === LikesStatuses.NONE && likeStatus !== prevLikeStatus && (prevLikeStatus === LikesStatuses.LIKE || prevLikeStatus === LikesStatuses.DISLIKE)) {
        console.log('3')
        if (prevLikeStatus === LikesStatuses.LIKE) comment.likesInfo.likesCount = comment.likesInfo.likesCount - 1
        if (prevLikeStatus === LikesStatuses.DISLIKE) comment.likesInfo.dislikesCount = comment.likesInfo.dislikesCount - 1
      }

      await comment.save()

      return true
    } catch (e) {
      console.log('updateCommentLikeStatuses repo error')
      return false
    }
  }
}