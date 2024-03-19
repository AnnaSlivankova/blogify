import mongoose from "mongoose";
import {PostDb} from "../../models/post-models/db/post-db";

const ExtendedLikesInfo = new mongoose.Schema({
  likesCount: {type: Number, require: true},
  dislikesCount: {type: Number, require: true},
})

export const PostSchema = new mongoose.Schema<PostDb>({
  title: {type: String, require: true},
  shortDescription: {type: String, require: true},
  content: {type: String, require: true},
  blogId: {type: String, require: true},
  blogName: {type: String, require: true},
  createdAt: {type: String, require: true},
  extendedLikesInfo: ExtendedLikesInfo
})

export const PostModel = mongoose.model<PostDb>('posts', PostSchema)