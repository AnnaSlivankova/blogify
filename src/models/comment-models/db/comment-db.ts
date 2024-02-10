export type CommentDb = {
  content: string
  commentatorInfo: {
    userId: string
    userLogin: string
  }
  createdAt: string
  postId: string
}