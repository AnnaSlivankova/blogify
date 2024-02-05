import {PostViewModel} from "../output/post-view-model";
import {PostDb} from "../db/post-db";
import {WithId} from "mongodb";

export const postMapper = (post: WithId<PostDb>): PostViewModel => {
  return {
    id: post._id.toString(),
    blogName: post.blogName,
    blogId: post.blogId,
    content: post.content,
    title: post.title,
    shortDescription: post.shortDescription,
    createdAt: post.createdAt
  }
}