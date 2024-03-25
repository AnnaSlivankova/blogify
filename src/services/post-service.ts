import {BlogQueryRepository} from "../repositories/blog/blog-query-repository";
import {PostDb} from "../models/post-models/db/post-db";
import {PostRepository} from "../repositories/post/post-repository";
import {PostQueryRepository} from "../repositories/post/post-query-repository";
import {PostViewModel} from "../models/post-models/output/post-view-model";
import {CreatePostModel} from "../models/post-models/input/create-post-model";
import {BlogRepository} from "../repositories/blog/blog-repository";
import {UpdatePostModel} from "../models/post-models/input/update-post-model";
import {ObjectId} from "mongodb";
import {LikesStatuses} from "../models/comment-models/db/comment-db";
import {ObjectResult, StatusCodes} from "../types";

export class PostService {
  static async createPost(createPostModel: CreatePostModel): Promise<PostViewModel | null> {
    const relevantBlog = await BlogQueryRepository.getBlogById(createPostModel.blogId)

    if (!relevantBlog) {
      return null
    }

    const newPost: PostDb = {
      title: createPostModel.title,
      content: createPostModel.content,
      shortDescription: createPostModel.shortDescription,
      blogId: createPostModel.blogId,
      blogName: relevantBlog.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0
      }
    }

    const createdPostId = await PostRepository.createPost(newPost)

    if (!createdPostId) {
      return null
    }

    const createdPost = await PostQueryRepository.getPostById(createdPostId, undefined)

    if (!createdPost) {
      return null
    }

    return createdPost
  }

  static async updatePost(postId: string, updatePostModel: UpdatePostModel): Promise<boolean | null> {
    const post = await PostRepository.getPostById(postId)
    const blog = await BlogRepository.getBlogById(updatePostModel.blogId)

    if (!post || !blog) {
      return null
    }

    return await PostRepository.updatePost(postId, updatePostModel)
  }

  static async deletePost(postId: string): Promise<boolean | null> {
    const post = await PostRepository.getPostById(postId)

    if (!post) {
      return null
    }

    return await PostRepository.deletePost(postId)
  }

  static async updateLikeStatus(postId: string, userId: ObjectId, likeStatus: LikesStatuses, login:string): Promise<ObjectResult> {
    const post = await PostRepository.getPostById(postId)
    if (!post) return {status: StatusCodes.NOT_FOUND}

    const prevLikeUserStatus = await PostRepository.getUserLikePostStatus(userId.toString(), postId)

    const isPostLikeStatusesUpdated = await PostRepository.updatePostLikeStatuses(postId, likeStatus, prevLikeUserStatus || LikesStatuses.NONE)
    if (!isPostLikeStatusesUpdated) return {status: StatusCodes.INTERNAL_SERVER_ERROR}

    if (!prevLikeUserStatus) {
      const createLikeData = await PostRepository.putUserPostLikeStatusInDB(userId.toString(), postId, likeStatus, login)
      if (!createLikeData) return {status: StatusCodes.INTERNAL_SERVER_ERROR}
    } else {
      const changePrevLikeUserStatus = await PostRepository.changeUserPostLikeStatusInDB(userId.toString(), postId, likeStatus)
      if (!changePrevLikeUserStatus) return {status: StatusCodes.INTERNAL_SERVER_ERROR}
    }

    return {status: StatusCodes.NO_CONTENT}
  }
}