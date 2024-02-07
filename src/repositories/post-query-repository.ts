import {PostViewModel} from "../models/post-models/output/post-view-model";
import {postsCollection} from "../db/db";
import {postMapper} from "../models/post-models/mapper/post-mapper";
import {ObjectId, SortDirection} from "mongodb";
import {Pagination} from "../types";

export class PostQueryRepository {
  static async getAllPosts(sortData: SortData): Promise<Pagination<PostViewModel> | null> {
    const {pageNumber, pageSize, sortDirection, sortBy} = sortData
    try {
      const posts = await postsCollection
        .find({})
        .sort(sortBy, sortDirection)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray()

      const totalCount = await postsCollection.countDocuments({})

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
      const post = await postsCollection.findOne({_id: new ObjectId(id)})

      if (!post) {
        return null
      }

      return postMapper(post)
    } catch (e) {
      return null
    }
  }

  static async getAllPostsByBlog(blogId: string, sortData: SortData): Promise<Pagination<PostViewModel> | null> {
    const {pageNumber, pageSize, sortDirection, sortBy} = sortData

    try {
      const posts = await postsCollection
        .find({blogId: blogId})
        .sort(sortBy, sortDirection)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray()

      if (!posts.length) {
        return null
      }

      const totalCount = await postsCollection.countDocuments({blogId: blogId})

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