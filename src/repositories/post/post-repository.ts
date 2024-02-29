import {PostDb} from "../../models/post-models/db/post-db";
import {ObjectId} from "mongodb";
import {UpdatePostModel} from "../../models/post-models/input/update-post-model";
import {PostModel} from "./post-schema";

export class PostRepository {
  static async getPostById(id: string): Promise<PostDb | null> {
    try {
      return PostModel.findOne({_id: new ObjectId(id)}).lean()
    } catch (e) {
      return null
    }
  }

  static async createPost(createdData: PostDb): Promise<string | null> {
    try {
      const post = new PostModel(createdData)
      await post.save()

      return post._id.toString()
    } catch (e) {
      return null
    }
  }

  static async updatePost(id: string, updatedData: UpdatePostModel): Promise<boolean> {
    try {
      const post = await PostModel.findOne({_id: new ObjectId(id)})
      if (!post) return false

      post.title = updatedData.title
      post.shortDescription = updatedData.shortDescription
      post.content = updatedData.content
      post.blogId = updatedData.blogId

      await post.save()

      return true
    } catch (e) {
      return false
    }
  }

  static async deletePost(id: string): Promise<boolean> {
    try {
      const post = await PostModel.findOne({_id: new ObjectId(id)})
      if (!post) return false

      const res = await post.deleteOne()

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }
}