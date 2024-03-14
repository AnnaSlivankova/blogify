export type CommentDb = {
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