import mongoose from "mongoose";
import {BlogDb} from "../../models/blog-models/db/blog-db";

export const BlogSchema = new mongoose.Schema<BlogDb>({
  name: {type: String, require: true},
  description: {type: String, require: true},
  websiteUrl: {type: String, require: true},
  createdAt: {type: String, require: true},
  isMembership: {type: Boolean, require: true},
})

export const BlogModel = mongoose.model<BlogDb>('blogs', BlogSchema)