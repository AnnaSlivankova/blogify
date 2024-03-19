import {NewestLikes, PostViewModel} from "../../models/post-models/output/post-view-model";
import {postMapper} from "../../models/post-models/mapper/post-mapper";
import {ObjectId, SortDirection} from "mongodb";
import {Pagination} from "../../types";
import {PostModel} from "./post-schema";
import {LikesStatuses} from "../../models/comment-models/db/comment-db";
import {JwtService} from "../../services/jwt-service";
import {LikePostStatusesModel} from "./like-post-statuses-schema";
import {LikePostStatusesDb} from "../../models/likes-models/db/like-post-statuses-db";

export class PostQueryRepository {
  static async getAllPosts(sortData: SortData, accessToken: string | undefined): Promise<Pagination<PostViewModel> | null> {
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

      const postsIds = posts.map(post => post._id.toString())
      const userLikeStatuses = await this.getCurrentLikesStatuses(accessToken, postsIds)
      if (!userLikeStatuses) return null

      const newestPostLikes = await this.getNewestPostsLikes(postsIds)

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: posts.map(post => {
          const currentLikeStatus = userLikeStatuses.find(el => el.postId === post._id.toString())

          const newestLikes = newestPostLikes!.find(el => el.postId === post._id.toString())

          return postMapper(post, currentLikeStatus?.likeStatus || LikesStatuses.NONE, newestLikes?.likes || [])
        })
      }
    } catch (e) {
      return null
    }
  }

  static async getPostById(id: string, accessToken: string | undefined): Promise<PostViewModel | null> {
    const userLikeStatus = await this.getCurrentLikeStatus(accessToken, id)
    if (!userLikeStatus) return null

    try {
      const post = await PostModel.findOne({_id: new ObjectId(id)}).lean()
      if (!post) return null

      const newestLikes = await LikePostStatusesModel
        .find({postId: id, likeStatus: LikesStatuses.LIKE})
        .sort({addedAt: -1})
        .limit(3)
        .lean()

      const mappedLikes: NewestLikes[] = newestLikes.map(el => ({
        addedAt: el.addedAt,
        userId: el.userId,
        login: el.login
      }))

      return postMapper(post, userLikeStatus, mappedLikes)
    } catch (e) {
      return null
    }
  }

  static async getCurrentLikeStatus(accessToken: string | undefined, postId: string): Promise<LikesStatuses | null> {
    if (!accessToken) return LikesStatuses.NONE
    try {
      const userId = await JwtService.getUserIdByToken(accessToken)
      if (!userId) return LikesStatuses.NONE

      const currentUserStatus = await LikePostStatusesModel.findOne({userId, postId}).lean()

      if (!currentUserStatus) {
        return LikesStatuses.NONE
      } else {
        return currentUserStatus.likeStatus
      }
    } catch (e) {
      console.log('getCurrentLikeStatus', e)
      return null
    }
  }

  static async getAllPostsByBlog(blogId: string, sortData: SortData, accessToken: string | undefined): Promise<Pagination<PostViewModel> | null> {
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

      const postsIds = posts.map(post => post._id.toString())
      const userLikeStatuses = await this.getCurrentLikesStatuses(accessToken, postsIds)
      if (!userLikeStatuses) return null

      const newestPostLikes = await this.getNewestPostsLikes(postsIds)


      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: posts.map(post => {
          const currentLikeStatus = userLikeStatuses.find(el => el.postId === post._id.toString())

          const newestLikes = newestPostLikes!.find(el => el.postId === post._id.toString())

          return postMapper(post, currentLikeStatus?.likeStatus || LikesStatuses.NONE, newestLikes?.likes || [])
        })
      }
    } catch (e) {
      return null
    }
  }

  static async getCurrentLikesStatuses(accessToken: string | undefined, postIds: string[]): Promise<LikePostStatusesDb[] | null> {
    if (!accessToken) {
      return postIds.map(postId => this.createDefaultLikeStatus(postId))
    }

    try {
      const userId = await JwtService.getUserIdByToken(accessToken)
      if (!userId) {
        return postIds.map(postId => this.createDefaultLikeStatus(postId))
      }

      return await LikePostStatusesModel.find({userId, postId: {$in: postIds}}).lean()
    } catch (e) {
      console.log('getCurrentLikesStatuses', e)
      return null
    }
  }

  static createDefaultLikeStatus(postId: string): LikePostStatusesDb {
    return {
      userId: 'noUserId',
      postId,
      likeStatus: LikesStatuses.NONE,
      addedAt: 'no date',
      login: 'no login'
    }
  }

  static async getNewestPostsLikes(postsIds: string[]): Promise<{ postId: string, likes: NewestLikes[] }[] | null> {
    try {
      const newestPostLikes = await Promise.all(postsIds.map(async postId => {

        const postLikes = await LikePostStatusesModel
          .find({postId: postId, likeStatus: LikesStatuses.LIKE})
          .sort({addedAt: -1})
          .limit(3)
          .lean()

        return {
          postId: postId,
          likes: postLikes.map(el => ({addedAt: el.addedAt, userId: el.userId, login: el.login}))
        }
      }))

      return newestPostLikes
    } catch (e) {
      console.log('getNewestPostsLikes', e)
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