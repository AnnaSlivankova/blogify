import {WithId} from "mongodb";
import {CommentDb, LikesStatuses} from "../db/comment-db";
import {CommentViewModel} from "../output/CommentViewModel";

export const commentMapper = (comment: WithId<CommentDb>, myStatus: LikesStatuses): CommentViewModel => {

  return {
    id: comment._id.toString(),
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin
    },
    content: comment.content,
    createdAt: comment.createdAt,
    likesInfo: {
      dislikesCount: comment.likesInfo.dislikesCount,
      likesCount: comment.likesInfo.likesCount,
      myStatus,
    }
  }
}