import {blogsCollection} from "../db/db";
import {ObjectId} from "mongodb";
import {UpdateBlogModel} from "../models/blog-models/input/update-blog-model";
import {BlogDb} from "../models/blog-models/db/blog-db";

export class BlogRepository {
  static async getBlogById(id: string): Promise<BlogDb | null> {
    try {
      const blog = await blogsCollection.findOne({_id: new ObjectId(id)})

      if (!blog) {
        return null
      }

      return blog
    } catch (e) {
      return null
    }
  }

  static async createBlog(createdData: BlogDb): Promise<string | null> {
    try {
      const res = await blogsCollection.insertOne(createdData)

      return res.insertedId.toString()
    } catch (e) {
      return null
    }
  }

  static async updateBlog(id: string, updatedData: UpdateBlogModel): Promise<boolean> {
    try {
      const res = await blogsCollection.updateOne({_id: new ObjectId(id)}, {
        $set: {
          name: updatedData.name,
          websiteUrl: updatedData.websiteUrl,
          description: updatedData.description
        }
      })

      return !!res.matchedCount
    } catch (e) {
      return false
    }
  }

  static async deleteBlog(id: string): Promise<boolean> {
    try {
      const res = await blogsCollection.deleteOne({_id: new ObjectId(id)})

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }
}