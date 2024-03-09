import {ObjectId} from "mongodb";

export type CommentDb = {
  //id
  // _id?:ObjectId,
  postId: string
  content: string
  createdAt: string
  commentatorInfo: {
    userId: string
    userLogin: string
  }
  likesInfo: {
    likesCount: number
    dislikesCount: number
  }
}

export enum LikesStatuses {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike'
}