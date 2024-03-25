import {LikesStatuses} from "../../comment-models/db/comment-db";

export type PostViewModel = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  createdAt: string
  extendedLikesInfo: ExtendedLikesInfo
}

type ExtendedLikesInfo = {
  likesCount: number
  dislikesCount: number
  myStatus: LikesStatuses
  newestLikes: NewestLikes[]
}

export type NewestLikes = {
  addedAt: string
  userId: string
  login: string
}