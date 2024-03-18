import {LikesStatuses} from "../../comment-models/db/comment-db";

export type LikeCommentStatusesDb = {
  commentId: string
  userId: string
  likeStatus: LikesStatuses
  iat: string
}