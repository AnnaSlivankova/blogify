import {LikesStatuses} from "../../comment-models/db/comment-db";

export type LikePostStatusesDb = {
  postId: string
  userId: string
  likeStatus: LikesStatuses
  addedAt: string
  login: string
}