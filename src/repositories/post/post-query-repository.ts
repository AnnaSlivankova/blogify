import {PostViewModel} from "../../models/post-models/output/post-view-model";
import {postMapper} from "../../models/post-models/mapper/post-mapper";
import {ObjectId, SortDirection} from "mongodb";
import {Pagination} from "../../types";
import {PostModel} from "./post-schema";

export class PostQueryRepository {
  static async getAllPosts(sortData: SortData): Promise<Pagination<PostViewModel> | null> {
    try {
      const {pageNumber, pageSize, sortDirection, sortBy} = sortData

      const posts = await PostModel
        .find()
        .sort({[sortBy]: sortDirection})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()

      const totalCount = await PostModel.countDocuments()
      const pagesCount = Math.ceil(totalCount / pageSize)

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: posts.map(postMapper)
      }
    } catch (e) {
      return null
    }
  }

  static async getPostById(id: string): Promise<PostViewModel | null> {
    try {
      const post = await PostModel.findOne({_id: new ObjectId(id)}).lean()
      if (!post) return null

      return postMapper(post)
    } catch (e) {
      return null
    }
  }

  static async getAllPostsByBlog(blogId: string, sortData: SortData): Promise<Pagination<PostViewModel> | null> {
    try {
      const {pageNumber, pageSize, sortDirection, sortBy} = sortData

      const posts = await PostModel
        .find({blogId: blogId})
        .sort({[sortBy]: sortDirection})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()

      if (!posts.length) return null

      const totalCount = await PostModel.countDocuments({blogId: blogId})
      const pagesCount = Math.ceil(totalCount / pageSize)

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: posts.map(postMapper)
      }
    } catch (e) {
      return null
    }
  }
}

type SortData = {
  pageNumber: number
  pageSize: number
  sortBy: string
  sortDirection: SortDirection
}