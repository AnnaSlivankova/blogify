import {ObjectId} from "mongodb";
import {UpdateBlogModel} from "../../models/blog-models/input/update-blog-model";
import {BlogDb} from "../../models/blog-models/db/blog-db";
import {BlogModel} from "./blog-schema";

export class BlogRepository {
  static async getBlogById(id: string): Promise<BlogDb | null> {
    try {
      const blog = await BlogModel.findOne({_id: new ObjectId(id)}).lean()
      if (!blog) return null

      return blog
    } catch (e) {
      return null
    }
  }

  static async createBlog(createdData: BlogDb): Promise<string | null> {
    try {
      const blog = new BlogModel(createdData)
      await blog.save()

      return blog._id.toString()
    } catch (e) {
      return null
    }
  }

  static async updateBlog(id: string, updatedData: UpdateBlogModel): Promise<boolean> {
    try {
      const blog = await BlogModel.findOne({_id: new ObjectId(id)})
      if (!blog) return false

      blog.name = updatedData.name
      blog.description = updatedData.description
      blog.websiteUrl = updatedData.websiteUrl

      await blog.save()

      return true
    } catch (e) {
      return false
    }
  }

  static async deleteBlog(id: string): Promise<boolean> {
    try {
      const blog = await BlogModel.findOne({_id: new ObjectId(id)})
      if (!blog) return false

      const res = await blog.deleteOne()

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }
}