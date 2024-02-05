import {PostViewModel} from "../models/post-models/output/post-view-model";
import {postsCollection} from "../db/db";
import {postMapper} from "../models/post-models/mapper/post-mapper";
import {PostDb} from "../models/post-models/db/post-db";
import {ObjectId} from "mongodb";
import {UpdatePostModel} from "../models/post-models/input/update-post-model";

export class PostRepository {
  static async getAll(): Promise<PostViewModel[] | boolean> {
    try {
      const posts = await postsCollection.find({}).toArray()

      return posts.map(postMapper)
    } catch (e) {
      return false
    }
  }

  static async getPostById(id: string): Promise<PostViewModel | boolean> {
    try {
      const post = await postsCollection.findOne({_id: new ObjectId(id)})

      if (!post) {
        return false
      }

      return postMapper(post)
    } catch (e) {
      return false
    }
  }

  static async createPost(createdData: PostDb): Promise<string | boolean> {
    try {
      const res = await postsCollection.insertOne(createdData)

      return res.insertedId.toString()
    } catch (e) {
      return false
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