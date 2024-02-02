import {BlogDB, db, PostDB} from "../db/db";
import {CreatePostModel} from "../models/post-models/CreatePostModel";
import {createUniqueId} from "../common/utilities/сreateUniqueId";
import {UpdatePostModel} from "../models/post-models/UpdatePostModel";


export class PostRepository {
  static getAll() {
    return db.posts
  }

  static createPost(createdData: CreatePostModel) {

    const relatedBlog = db.blogs.find(b => b.id === createdData.blogId) as BlogDB

    const createdPost: PostDB = {
      id: createUniqueId(),
      blogName: relatedBlog.name,
      ...createdData
    }

    db.posts.push(createdPost)

    return createdPost
  }

  static getPostById(id: string) {
    return db.posts.find(p => p.id === id)
  }

  static updatePost(data: { id: string, updateData: UpdatePostModel }) {
    db.posts = db.posts.map(p => p.id === data.id ? ({...p, ...data.updateData}) : p)

    return
  }

  static deletePost(id: string) {
    db.posts = db.posts.filter(p => p.id !== id)

    return
  }

}