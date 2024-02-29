import {CreateCommentModel} from "../models/comment-models/input/create-comment-model";
import {PostRepository} from "../repositories/post/post-repository";
import {CommentDb} from "../models/comment-models/db/comment-db";
import {CommentRepository} from "../repositories/comment/comment-repository";
import {ObjectId} from "mongodb";
import {UserRepository} from "../repositories/user/user-repository";
import {CommentQueryRepository} from "../repositories/comment/comment-query-repository";
import {CommentViewModel} from "../models/comment-models/output/CommentViewModel";
import {UpdateCommentModel} from "../models/comment-models/input/update-comment-model";

export class CommentService {
  static async createComment(postId: string, createCommentModel: CreateCommentModel, userId: ObjectId): Promise<CommentViewModel | null> {
    const relevantPost = await PostRepository.getPostById(postId)

    if (!relevantPost) {
      return null
    }

    const relevantUser = await UserRepository.getUserById(userId)

    if (!relevantUser) {
      return null
    }

    const newComment: CommentDb = {
      content: createCommentModel.content,
      commentatorInfo: {
        userLogin: relevantUser.login,
        userId: relevantUser._id.toString()
      },
      createdAt: new Date().toISOString(),
      postId: postId
    }

    const createdCommentId = await CommentRepository.createComment(newComment)

    if (!createdCommentId) {
      return null
    }

    const createdComment = await CommentQueryRepository.getCommentById(createdCommentId)

    if (!createdComment) {
      return null
    }

    return createdComment
  }

  static async updateComment(commentId: string, updateCommentModel: UpdateCommentModel): Promise<boolean | null> {
    const comment = await CommentRepository.getCommentById(commentId)

    if (!comment) {
      return null
    }

    return await CommentRepository.updateComment(commentId, updateCommentModel)
  }

  static async deleteCommentById(id: string): Promise<boolean | null> {
    const comment = await CommentRepository.getCommentById(id)

    if (!comment) {
      return null
    }

    return await CommentRepository.deleteComment(id)
  }
}