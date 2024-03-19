import mongoose from "mongoose";
import {LikesStatuses} from "../../models/comment-models/db/comment-db";
import {LikePostStatusesDb} from "../../models/likes-models/db/like-post-statuses-db";

export const LikePostStatusesSchema = new mongoose.Schema<LikePostStatusesDb>({
  postId: {type: String, require: true},
  userId: {type: String, require: true},
  login: {type: String, require: true},
  likeStatus: {type: String, enum: LikesStatuses, require: true},
  addedAt: {type: String, require: true}
})

export const LikePostStatusesModel = mongoose.model<LikePostStatusesDb>('like-post-statuses', LikePostStatusesSchema)