import {BlogDB, db} from "../db/db";
import {CreateBlogModel} from "../models/blog-models/CreateBlogModel";
import {createUniqueId} from "../common/utilities/сreateUniqueId";
import {UpdateBlogModel} from "../models/blog-models/UpdateBlogModel";

export class BlogRepository {
  static getAll() {
    return db.blogs
  }

  static createBlog(createdData: CreateBlogModel) {

    const createdBlogWithId: BlogDB = {
      id: createUniqueId(),
      ...createdData
    }

    db.blogs.push(createdBlogWithId)

    return createdBlogWithId
  }

  static getById(id: string) {
    return db.blogs.find(b => b.id === id)
  }

  static updateBlog(data: { id: string, updateData: UpdateBlogModel }) {
    db.blogs = db.blogs.map(b => b.id === data.id ? ({...b, ...data.updateData}) : b)

    return
  }

  static deleteBlog(id: string) {
    db.blogs = db.blogs.filter(b => b.id !== id)

    return
  }

}