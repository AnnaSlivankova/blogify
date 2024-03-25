import {NewestLikes, PostViewModel} from "../output/post-view-model";
import {PostDb} from "../db/post-db";
import {WithId} from "mongodb";
import {LikesStatuses} from "../../comment-models/db/comment-db";

export const postMapper = (post: WithId<PostDb>, myStatus: LikesStatuses, newestLikes: NewestLikes[]): PostViewModel => {
  return {
    id: post._id.toString(),
    blogName: post.blogName,
    blogId: post.blogId,
    content: post.content,
    title: post.title,
    shortDescription: post.shortDescription,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      likesCount: post.extendedLikesInfo.likesCount,
      myStatus,
      newestLikes
    }
  }
}