import {commentsCollection} from "../db/db";
import {CommentDb} from "../models/comment-models/db/comment-db";
import {ObjectId} from "mongodb";
import {UpdateCommentModel} from "../models/comment-models/input/update-comment-model";

export class CommentRepository {
  static async createComment(createdData: CommentDb): Promise<string | null> {
    try {
      const res = await commentsCollection.insertOne(createdData)

      return res.insertedId.toString()
    } catch (e) {
      return null
    }
  }

  static async updateComment(id: string, updatedData: UpdateCommentModel): Promise<boolean> {
    try {
      const res = await commentsCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set: {content: updatedData.content}}
      )

      return !!res.matchedCount
    } catch (e) {
      return false
    }
  }

  static async getCommentById(id: string): Promise<CommentDb | null> {
    try {
      const comment = await commentsCollection.findOne({_id: new ObjectId(id)})

      if (!comment) {
        return null
      }

      return comment
    } catch (e) {
      return null
    }
  }

  static async deleteComment(id: string): Promise<boolean> {
    try {
      const res = await commentsCollection.deleteOne({_id: new ObjectId(id)})

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }
}