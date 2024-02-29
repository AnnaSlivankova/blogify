import {CommentDb} from "../../models/comment-models/db/comment-db";
import {ObjectId} from "mongodb";
import {UpdateCommentModel} from "../../models/comment-models/input/update-comment-model";
import {CommentModel} from "./comment-schema";

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
}