import {blogMapper} from "../../models/blog-models/mapper/blog-mapper";
import {BlogViewModel} from "../../models/blog-models/output/blog-view-model";
import {ObjectId, SortDirection} from "mongodb";
import {Pagination} from "../../types";
import {BlogModel} from "./blog-schema";

export class BlogQueryRepository {
  static async getAllBlogs(sortData: SortData): Promise<Pagination<BlogViewModel> | null> {
    try {
      const {searchNameTerm, pageSize, pageNumber, sortBy, sortDirection} = sortData

      let query = BlogModel.find()
      let queryForCount = BlogModel.find()

      if (searchNameTerm) {
        const regExp = new RegExp(searchNameTerm, 'i')
        query.where('name').regex(regExp)
        queryForCount.where('name').regex(regExp)
      }

      const blogs = await query
        .sort({[sortBy]: sortDirection})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()

      const totalCount = await queryForCount.countDocuments()
      const pagesCount = Math.ceil(totalCount / pageSize)

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: blogs.map(blogMapper)
      }
    } catch (e) {
      console.log('blogs failed', e)
      return null
    }
  }

  static async getBlogById(id: string): Promise<BlogViewModel | null> {
    try {
      const blog = await BlogModel.findOne({_id: new ObjectId(id)}).lean()

      if (!blog) return null

      return blogMapper(blog!)
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