import {blogMapper} from "../models/blog-models/mapper/blog-mapper";
import {BlogViewModel} from "../models/blog-models/output/blog-view-model";
import {blogsCollection} from "../db/db";
import {ObjectId} from "mongodb";
import {UpdateBlogModel} from "../models/blog-models/input/update-blog-model";
import {BlogDb} from "../models/blog-models/db/blog-db";

export class BlogRepository {
  static async getAll(): Promise<BlogViewModel[] | boolean> {
    try {
      const blogs = await blogsCollection.find({}).toArray()

      return blogs.map(blogMapper)
    } catch (e) {
      return false
    }
  }

  static async getById(id: string): Promise<BlogViewModel | boolean> {
    try {
      const blog = await blogsCollection.findOne({_id: new ObjectId(id)})

      if (!blog) {
        return false
      }

      return blogMapper(blog)
    } catch (e) {
      return false
    }
  }

  static async createBlog(createdData: BlogDb): Promise<BlogViewModel | null | boolean> {
    try {
      const res = await blogsCollection.insertOne(createdData)

      return this.getById(res.insertedId.toString())
      // return res.insertedId.toString() //или вернуть айдишку созданного блога и в контроллере запросить созданный блог по этой айдишке
    } catch (e) {
      return false
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