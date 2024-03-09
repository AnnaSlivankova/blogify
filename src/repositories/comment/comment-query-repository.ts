import {CommentViewModel} from "../../models/comment-models/output/CommentViewModel";
import {ObjectId, SortDirection} from "mongodb";
import {commentMapper} from "../../models/comment-models/mapper/comment-mapper";
import {Pagination} from "../../types";
import {CommentModel} from "./comment-schema";
import {LikesStatuses} from "../../models/comment-models/db/comment-db";
import {LikeCommentStatusesDb} from "../../models/likes-models/db/like-comment-statuses-db";

export class CommentQueryRepository {
  static async getCommentById(id: string, userLikeStatus: LikesStatuses): Promise<CommentViewModel | null> {
    try {
      const comment = await CommentModel.findOne({_id: new ObjectId(id)}).lean()
      if (!comment) return null

      return commentMapper(comment, userLikeStatus??LikesStatuses.NONE)
    } catch (e) {
      console.log('getCommentById qr error')
      return null
    }
  }

  static async getComments(postId: string, sortData: SortData, userLikeStatuses: LikeCommentStatusesDb[] | null): Promise<Pagination<CommentViewModel> | null> {
    let ls: LikeCommentStatusesDb[]  = []

    if(userLikeStatuses) {
      ls = userLikeStatuses
    }

    try {
      console.log('userLikeStatuses', userLikeStatuses)

      const {sortDirection, sortBy, pageSize, pageNumber} = sortData

      const comments = await CommentModel
        .find({postId: postId})
        .sort({[sortBy]: sortDirection})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()

      const totalCount = await CommentModel.countDocuments({postId: postId})
      const pagesCount = Math.ceil(totalCount / pageSize)

      return {
        totalCount,
        pageSize,
        pagesCount,
        page: pageNumber,
        items: comments.map(comment => {
          const userLikeStatus = ls
            .find(el => el.commentId === comment._id.toString())

          return commentMapper(comment, userLikeStatus?.likeStatus ?? LikesStatuses.NONE)
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