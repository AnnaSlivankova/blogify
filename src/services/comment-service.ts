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
import {LikeCommentStatusesDb} from "../models/likes-models/db/like-comment-statuses-db";
import {JwtService} from "./jwt-service";

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

    const userLikeStatus = await CommentRepository.getUserLikeCommentStatus(userId.toString(), createdCommentId)

    const createdComment = await CommentQueryRepository.getCommentById(createdCommentId, userLikeStatus ?? LikesStatuses.NONE)
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

  static async getCurrentUserLikeCommentStatus(commentId: string, userId: string): Promise<LikesStatuses | null> {
    const currentLikeStatus = await CommentRepository.getUserLikeCommentStatus(userId, commentId)
    if (!currentLikeStatus) return null

    return currentLikeStatus
  }

  static async getCurrentUserLikeCommentStatusRT(commentId: string, rt: string): Promise<LikesStatuses | null> {
    const userId = await JwtService.getUserIdByToken(rt)

    if(!userId) {
      return LikesStatuses.NONE
    }

    const currentLikeStatus = await CommentRepository.getUserLikeCommentStatus(userId.toString(), commentId)
    if (!currentLikeStatus) return null

    return currentLikeStatus
  }

  static async getCurrentUserLikeCommentsStatusesRT(postId: string, rt: string): Promise<null | LikeCommentStatusesDb[]> {
    const userId = await JwtService.getUserIdByToken(rt)

    if(!userId) {
      const comments = await CommentRepository.getAllPostComments(postId)
      if(!comments) return null

      console.log('comments', comments)

      const likeUserStatuses: LikeCommentStatusesDb[] = []

      for (let i = 0; i < comments.length; i++) {
        likeUserStatuses.push({userId: 'null', commentId: comments[i]._id.toString(), likeStatus: LikesStatuses.NONE})
      }

      console.log('likeUserStatuses', likeUserStatuses)

      return likeUserStatuses
    }


    const currentLikeUserStatuses = await CommentRepository.getUserLikeCommentsStatuses(userId.toString())

    console.log('currentLikeUserStatuses from service', currentLikeUserStatuses)
    if (!currentLikeUserStatuses) return null

    return currentLikeUserStatuses
  }




  static async getCurrentUserLikeCommentsStatuses(userId: string): Promise<null | LikeCommentStatusesDb[]> {
    const currentLikeStatuses = await CommentRepository.getUserLikeCommentsStatuses(userId)

    if (!currentLikeStatuses) return null

    return currentLikeStatuses
  }

  static async updateLikeStatus(commentId: string, userId: ObjectId, likeStatus: LikesStatuses): Promise<ObjectResult<null>> {
    const comment = await CommentRepository.getCommentById(commentId)
    if (!comment) return {status: StatusCodes.NOT_FOUND, data: null}

    const prevLikeUserStatus = await CommentRepository.getUserLikeCommentStatus(userId.toString(), commentId)
    console.log('prevLikeUserStatus', prevLikeUserStatus)
    // if (!prevLikeUserStatus) return {status: StatusCodes.INTERNAL_SERVER_ERROR, data: null}

    const isCommentLikeStatusesUpdated = await CommentRepository.updateCommentLikeStatuses(commentId, likeStatus, prevLikeUserStatus ?? LikesStatuses.NONE)
    console.log('isCommentLikeStatusesUpdated', isCommentLikeStatusesUpdated)
    if (!isCommentLikeStatusesUpdated) return {status: StatusCodes.INTERNAL_SERVER_ERROR, data: null}


    if (!prevLikeUserStatus) {
      const createLikeData = await CommentRepository.putUserCommentLikeStatusInDB(userId.toString(), commentId, likeStatus)
      if (!createLikeData) return {status: StatusCodes.INTERNAL_SERVER_ERROR, data: null}
    } else {
      const changePrevLikeUserStatus = await CommentRepository.changeUserCommentLikeStatusInDB(userId.toString(), commentId, likeStatus)
      console.log('changePrevLikeUserStatus', changePrevLikeUserStatus)
      if (!changePrevLikeUserStatus) return {status: StatusCodes.INTERNAL_SERVER_ERROR, data: null}
    }


    return {status: StatusCodes.NO_CONTENT, data: null}
  }

}