import {CommentViewModel} from "../../models/comment-models/output/CommentViewModel";
import {ObjectId, SortDirection} from "mongodb";
import {commentMapper} from "../../models/comment-models/mapper/comment-mapper";
import {Pagination} from "../../types";
import {CommentModel} from "./comment-schema";

export class CommentQueryRepository {
  static async getCommentById(id: string): Promise<CommentViewModel | null> {
    try {
      const comment = await CommentModel.findOne({_id: new ObjectId(id)}).lean()
      if (!comment) return null

      return commentMapper(comment)
    } catch (e) {
      return null
    }
  }

  static async getComments(postId: string, sortData: SortData): Promise<Pagination<CommentViewModel> | null> {
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

      return {
        totalCount,
        pageSize,
        pagesCount,
        page: pageNumber,
        items: comments.map(commentMapper)
      }
    } catch (e) {
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