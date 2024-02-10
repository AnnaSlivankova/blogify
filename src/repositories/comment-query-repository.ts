import {CommentViewModel} from "../models/comment-models/output/CommentViewModel";
import {commentsCollection} from "../db/db";
import {ObjectId, SortDirection} from "mongodb";
import {commentMapper} from "../models/comment-models/mapper/comment-mapper";
import {Pagination} from "../types";

export class CommentQueryRepository {
  static async getCommentById(id: string): Promise<CommentViewModel | null> {
    try {
      const comment = await commentsCollection.findOne({_id: new ObjectId(id)})

      if (!comment) {
        return null
      }

      return commentMapper(comment)
    } catch (e) {
      return null
    }
  }

  static async getComments(postId: string, sortData: SortData): Promise<Pagination<CommentViewModel> | null> {
    const {sortDirection, sortBy, pageSize, pageNumber} = sortData

    try {
      const comments = await commentsCollection
        .find({postId: postId})
        .sort(sortBy, sortDirection)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray()

      const totalCount = await commentsCollection.countDocuments({postId: postId})

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
  sortDirection?: SortDirection
}