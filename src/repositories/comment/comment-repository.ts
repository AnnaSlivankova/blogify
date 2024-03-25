import {CommentDb, LikesStatuses} from "../../models/comment-models/db/comment-db";
import {ObjectId} from "mongodb";
import {UpdateCommentModel} from "../../models/comment-models/input/update-comment-model";
import {CommentModel} from "./comment-schema";
import {LikeCommentStatusesModel} from "./like-comment-statuses-schema";

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

  static async putUserCommentLikeStatusInDB(userId: string, commentId: string, likeStatus: LikesStatuses): Promise<LikesStatuses | null> {
    try {
      const res = new LikeCommentStatusesModel({userId, commentId, likeStatus, addedAt: new Date().toISOString()})
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

  static async updateCommentLikeStatuses(id: string, likeStatus: LikesStatuses, prevLikeStatus: string): Promise<boolean> {
    try {
      const comment = await CommentModel.findOne({_id: id})
      if (!comment) return false

      changeLikeStatus(comment.likesInfo, likeStatus, prevLikeStatus)

      await comment.save()

      return true
    } catch (e) {
      console.log('updateCommentLikeStatuses repo error')
      return false
    }
  }
}

export const changeLikeStatus = (info: any, likeStatus: LikesStatuses, prevLikeStatus: string) => {
  switch(likeStatus) {
    case
    LikesStatuses.LIKE
    :
      if (prevLikeStatus !== LikesStatuses.LIKE) {
        info.likesCount++
      }
      if (prevLikeStatus === LikesStatuses.DISLIKE) {
        info.dislikesCount--
      }
      break;

    case
    LikesStatuses.DISLIKE
    :
      if (prevLikeStatus !== LikesStatuses.DISLIKE) {
        info.dislikesCount++
      }
      if (prevLikeStatus === LikesStatuses.LIKE) {
        info.likesCount--
      }
      break;

    case
    LikesStatuses.NONE
    :
      if (prevLikeStatus !== LikesStatuses.NONE) {
        if (prevLikeStatus === LikesStatuses.LIKE) {
          info.likesCount--
        }
        if (prevLikeStatus === LikesStatuses.DISLIKE) {
          info.dislikesCount--
        }
      }
      break;

    default:
      break;
  }
}

