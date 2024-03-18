import {CommentViewModel} from "../../models/comment-models/output/CommentViewModel";
import {ObjectId, SortDirection} from "mongodb";
import {commentMapper} from "../../models/comment-models/mapper/comment-mapper";
import {Pagination} from "../../types";
import {CommentModel} from "./comment-schema";
import {LikesStatuses} from "../../models/comment-models/db/comment-db";
import {LikeCommentStatusesDb} from "../../models/likes-models/db/like-comment-statuses-db";
import {LikeCommentStatusesModel} from "./like-comment-statuses-schema";
import {JwtService} from "../../services/jwt-service";

export class CommentQueryRepository {
  static createDefaultLikeStatus(commentId: string): LikeCommentStatusesDb {
    return {
      userId: 'noUserId',
      commentId: commentId,
      likeStatus: LikesStatuses.NONE,
      iat: new Date().toISOString()
    }
  }

  static async getCurrentLikeStatus(accessToken: string | undefined, commentId: string): Promise<LikesStatuses | null> {
    if (!accessToken) return LikesStatuses.NONE
    try {
      const userId = await JwtService.getUserIdByToken(accessToken)
      if (!userId) return LikesStatuses.NONE

      const currentUserStatus = await LikeCommentStatusesModel.findOne({userId, commentId}).lean()

      if (!currentUserStatus) {
        return LikesStatuses.NONE
      } else {
        return currentUserStatus.likeStatus
      }
    } catch (e) {
      console.log('getCurrentLikeStatus', e)
      return null
    }
  }

  static async getCurrentLikesStatuses(accessToken: string | undefined, commentsIds: string[]): Promise<LikeCommentStatusesDb[] | null> {
    if (!accessToken) {
      return commentsIds.map(commentId => this.createDefaultLikeStatus(commentId))
    }

    try {
      const userId = await JwtService.getUserIdByToken(accessToken)
      if (!userId) {
        return commentsIds.map(commentId => this.createDefaultLikeStatus(commentId))
      }

      return await LikeCommentStatusesModel.find({userId, commentId: {$in: commentsIds}}).lean()
    } catch (e) {
      console.log('getCurrentLikesStatuses', e)
      return null
    }
  }

  static async getCommentById(id: string, accessToken: string | undefined): Promise<CommentViewModel | null> {
    const userLikeStatus = await this.getCurrentLikeStatus(accessToken, id)
    if (!userLikeStatus) return null

    try {
      const comment = await CommentModel.findOne({_id: new ObjectId(id)}).lean()
      if (!comment) return null

      return commentMapper(comment, userLikeStatus)
    } catch (e) {
      console.log('getCommentById qr error', e)
      return null
    }
  }

  static async getComments(postId: string, sortData: SortData, accessToken: string | undefined): Promise<Pagination<CommentViewModel> | null> {
    try {
      const {sortDirection, sortBy, pageSize, pageNumber} = sortData

      const comments = await CommentModel
        .find({postId: postId})
        .sort({[sortBy]: sortDirection})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()

      const totalCount = await CommentModel.countDocuments({postId: postId})
      const pagesCount = Math.ceil(totalCount / pageSize)

      const commentsIds = comments.map(comment => comment._id.toString())

      const userLikeStatus = await this.getCurrentLikesStatuses(accessToken, commentsIds)
      if (!userLikeStatus) return null

      return {
        totalCount,
        pageSize,
        pagesCount,
        page: pageNumber,
        items: comments.map(comment => {
          const currentLikeStatus = userLikeStatus.find(el => el.commentId === comment._id.toString())

          return commentMapper(comment, currentLikeStatus?.likeStatus || LikesStatuses.NONE)
        })
      }
    } catch (e) {
      console.log('getComments qr error', e)
      return null
    }
  }
}

type SortData = {
  pageNumber: number
  pageSize: number
  sortBy: string
  sortDirection: SortDirection
}