import {WithId} from "mongodb";
import {CommentDb} from "../db/comment-db";
import {CommentViewModel} from "../output/CommentViewModel";

export const commentMapper = (comment: WithId<CommentDb>): CommentViewModel => {
  return {
    id: comment._id.toString(),
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin
    },
    content: comment.content,
    createdAt: comment.createdAt
  }
}