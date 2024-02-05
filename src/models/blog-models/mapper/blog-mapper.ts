import {BlogDb} from "../db/blog-db";
import {WithId} from "mongodb";
import {BlogViewModel} from "../output/blog-view-model";

export const blogMapper = (blog: WithId<BlogDb>): BlogViewModel => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership
  }
}