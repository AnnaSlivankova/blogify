import mongoose from "mongoose";
import {LikesStatuses} from "../../models/comment-models/db/comment-db";
import {LikeCommentStatusesDb} from "../../models/likes-models/db/like-comment-statuses-db";

export const LikeCommentStatusesSchema = new mongoose.Schema<LikeCommentStatusesDb>({
  commentId: {type: String, require: true},
  userId: {type: String, require: true},
  likeStatus: {type: String, enum: LikesStatuses, require: true},
})

export const LikeCommentStatusesModel = mongoose.model<LikeCommentStatusesDb>('LikeCommentStatuses', LikeCommentStatusesSchema)