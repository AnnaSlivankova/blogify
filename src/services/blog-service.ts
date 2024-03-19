import {BlogRepository} from "../repositories/blog/blog-repository";
import {PostDb} from "../models/post-models/db/post-db";
import {PostRepository} from "../repositories/post/post-repository";
import {PostQueryRepository} from "../repositories/post/post-query-repository";
import {CreatePostFromBlogModel} from "../models/blog-models/input/create-post-from-blog-model";
import {PostViewModel} from "../models/post-models/output/post-view-model";
import {BlogQueryRepository} from "../repositories/blog/blog-query-repository";
import {UpdateBlogModel} from "../models/blog-models/input/update-blog-model";
import {BlogViewModel} from "../models/blog-models/output/blog-view-model";
import {CreateBlogModel} from "../models/blog-models/input/create-blog-model";
import {BlogDb} from "../models/blog-models/db/blog-db";

export class BlogService {
  static async createBlog(createBlogModel: CreateBlogModel): Promise<BlogViewModel | null> {
    const newBlog: BlogDb = {
      name: createBlogModel.name,
      description: createBlogModel.description,
      websiteUrl: createBlogModel.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false
    }

    const createdBlogId = await BlogRepository.createBlog(newBlog)

    if (!createdBlogId) {
      return null
    }

    const createdBlog = await BlogQueryRepository.getBlogById(createdBlogId)

    if (!createdBlog) {
      return null
    }

    return createdBlog
  }


  static async createPostToBlog(blogId: string, createPostModel: CreatePostFromBlogModel): Promise<PostViewModel | null> {
    const {title, shortDescription, content} = createPostModel

    const blog = await BlogRepository.getBlogById(blogId)

    if (!blog) {
      return null
    }

    const newPost: PostDb = {
      title,
      shortDescription,
      content,
      createdAt: new Date().toISOString(),
      blogId,
      blogName: blog.name,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0
      }
    }

    const createdPostId = await PostRepository.createPost(newPost)

    if (!createdPostId) {
      return null
    }

    const post = await PostQueryRepository.getPostById(createdPostId, undefined)

    if (!post) {
      return null
    }

    return post
  }

  static async updateBlogById(blogId: string, updateBlogModel: UpdateBlogModel): Promise<boolean | null> {
    const blog = await BlogQueryRepository.getBlogById(blogId)

    if (!blog) {
      return null
    }

    return await BlogRepository.updateBlog(blogId, updateBlogModel)
  }

  static async deleteBlogById(blogId: string): Promise<boolean | null> {
    const blog = await BlogQueryRepository.getBlogById(blogId)

    if (!blog) {
      return null
    }

    const isBlogDeleted = await BlogRepository.deleteBlog(blogId)

    if (!isBlogDeleted) {
      return null
    }

    return isBlogDeleted
  }
}