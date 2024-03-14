import {CreateCommentModel} from "../models/comment-models/input/create-comment-model";
import {PostRepository} from "../repositories/post/post-repository";
import {CommentDb, LikesStatuses} from "../models/comment-models/db/comment-db";
import {CommentRepository} from "../repositories/comment/comment-repository";
import {ObjectId} from "mongodb";
import {UserRepository} from "../repositories/user/user-repository";
import {CommentQueryRepository} from "../repositories/comment/comment-query-repository";
import {CommentViewModel} from "../models/comment-models/output/CommentViewModel";
import {UpdateCommentModel} from "../models/comment-models/input/update-comment-model";
import {ObjectResult, StatusCodes} from "../types";

export class CommentService {
  static async createComment(postId: string, createCommentModel: CreateCommentModel, userId: ObjectId): Promise<CommentViewModel | null> {
    const relevantPost = await PostRepository.getPostById(postId)
    if (!relevantPost) return null

    const relevantUser = await UserRepository.getUserById(userId)
    if (!relevantUser) return null

    const newComment: CommentDb = {
      postId: postId,
      content: createCommentModel.content,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        userLogin: relevantUser.login,
        userId: relevantUser._id.toString()
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0
      }
    }

    const createdCommentId = await CommentRepository.createComment(newComment)
    if (!createdCommentId) return null

    const createdComment = await CommentQueryRepository.getCommentById(createdCommentId, LikesStatuses.NONE)
    if (!createdComment) return null

    return createdComment
  }

  static async updateComment(commentId: string, updateCommentModel: UpdateCommentModel): Promise<boolean | null> {
    const comment = await CommentRepository.getCommentById(commentId)
    if (!comment) return null

    return await CommentRepository.updateComment(commentId, updateCommentModel)
  }

  static async deleteCommentById(id: string): Promise<boolean | null> {
    const comment = await CommentRepository.getCommentById(id)
    if (!comment) return null

    return await CommentRepository.deleteComment(id)
  }

  static async updateLikeStatus(commentId: string, userId: ObjectId, likeStatus: LikesStatuses): Promise<ObjectResult> {
    const comment = await CommentRepository.getCommentById(commentId)
    if (!comment) return {status: StatusCodes.NOT_FOUND}

    const prevLikeUserStatus = await CommentRepository.getUserLikeCommentStatus(userId.toString(), commentId)

    const isCommentLikeStatusesUpdated = await CommentRepository.updateCommentLikeStatuses(commentId, likeStatus, prevLikeUserStatus || LikesStatuses.NONE)
    if (!isCommentLikeStatusesUpdated) return {status: StatusCodes.INTERNAL_SERVER_ERROR}

    if (!prevLikeUserStatus) {
      const createLikeData = await CommentRepository.putUserCommentLikeStatusInDB(userId.toString(), commentId, likeStatus)
      if (!createLikeData) return {status: StatusCodes.INTERNAL_SERVER_ERROR}
    } else {
      const changePrevLikeUserStatus = await CommentRepository.changeUserCommentLikeStatusInDB(userId.toString(), commentId, likeStatus)
      if (!changePrevLikeUserStatus) return {status: StatusCodes.INTERNAL_SERVER_ERROR}
    }

    return {status: StatusCodes.NO_CONTENT}
  }
}