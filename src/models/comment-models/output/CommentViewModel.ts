import {LikesStatuses} from "../db/comment-db";

export type CommentViewModel = {
  id: string
  content: string
  createdAt: string
  commentatorInfo: {
    userId: string
    userLogin: string
  }
  likesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LikesStatuses
  }
}