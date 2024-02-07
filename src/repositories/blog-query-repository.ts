import {blogMapper} from "../models/blog-models/mapper/blog-mapper";
import {BlogViewModel} from "../models/blog-models/output/blog-view-model";
import {blogsCollection} from "../db/db";
import {ObjectId, SortDirection} from "mongodb";
import {Pagination} from "../types";

export class BlogQueryRepository {
  static async getAllBlogs(sortData: SortData): Promise<Pagination<BlogViewModel> | null> {
    let filter = {}
    const {searchNameTerm, pageSize, pageNumber, sortBy, sortDirection} = sortData

    if (searchNameTerm) {
      filter = {
        name: {
          $regex: searchNameTerm,
          $options: 'i'
        }
      }
    }

    try {
      const blogs = await blogsCollection
        .find(filter)
        .sort(sortBy, sortDirection)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray()

      const totalCount = await blogsCollection.countDocuments(filter)

      const pagesCount = Math.ceil(totalCount / pageSize)

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: blogs.map(blogMapper)
      }
    } catch (e) {
      return null
    }
  }

  static async getBlogById(id: string): Promise<BlogViewModel | null> {
    try {
      const blog = await blogsCollection.findOne({_id: new ObjectId(id)})

      if (!blog) {
        return null
      }

      return blogMapper(blog)
    } catch (e) {
      return null
    }
  }
}

type SortData = {
  searchNameTerm: string | null
  sortBy: string
  sortDirection: SortDirection
  pageNumber: number
  pageSize: number
}