import {postsCollection} from "../db/db";
import {PostDb} from "../models/post-models/db/post-db";
import {ObjectId} from "mongodb";
import {UpdatePostModel} from "../models/post-models/input/update-post-model";

export class PostRepository {
  static async getPostById(id: string): Promise<PostDb | null> {
    try {
      const post = await postsCollection.findOne({_id: new ObjectId(id)})

      if (!post) {
        return null
      }

      return post
    } catch (e) {
      return null
    }
  }

  static async createPost(createdData: PostDb): Promise<string | null> {
    try {
      const res = await postsCollection.insertOne(createdData)

      return res.insertedId.toString()
    } catch (e) {
      return null
    }
  }

  static async updatePost(id: string, updatedData: UpdatePostModel): Promise<boolean> {
    try {
      const res = await postsCollection.updateOne({_id: new ObjectId(id)}, {
        $set: {
          title: updatedData.title,
          shortDescription: updatedData.shortDescription,
          content: updatedData.content,
          blogId: updatedData.blogId
        }
      })

      return !!res.matchedCount
    } catch (e) {
      return false
    }
  }

  static async deletePost(id: string): Promise<boolean> {
    try {
      const res = await postsCollection.deleteOne({_id: new ObjectId(id)})

      return !!res.deletedCount
    } catch (e) {
      return false
    }
  }
}