import mongoose from "mongoose";
import {CommentDb} from "../../models/comment-models/db/comment-db";

export const CommentSchema = new mongoose.Schema<CommentDb>({
  content: {type: String, require: true},
  createdAt: {type: String, require: true},
  postId: {type: String, require: true},
  commentatorInfo: {
    userId: {type: String, require: true},
    userLogin: {type: String, require: true},
  }
})

export const CommentModel = mongoose.model<CommentDb>('comments', CommentSchema)