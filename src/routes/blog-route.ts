import {Request, Response, Router} from "express";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {blogValidation} from "../validators/blog-validators";
import {
  Pagination,
  RequestWithBody,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../types";
import {BlogViewModel} from "../models/blog-models/output/blog-view-model";
import {CreateBlogModel} from "../models/blog-models/input/create-blog-model";
import {UpdateBlogModel} from "../models/blog-models/input/update-blog-model";
import {QueryBlogModel} from "../models/blog-models/input/query-blog-model";
import {BlogQueryRepository} from "../repositories/blog/blog-query-repository";
import {createPostFromBlogValidation} from "../validators/post-validators";
import {CreatePostFromBlogModel} from "../models/blog-models/input/create-post-from-blog-model";
import {PostViewModel} from "../models/post-models/output/post-view-model";
import {BlogService} from "../services/blog-service";
import {PostQueryRepository} from "../repositories/post/post-query-repository";
import {QueryPostModel} from "../models/post-models/input/query-post-model";
import {idValidationMiddleware} from "../middlewares/id-validation-middleware";

export const blogRoute = Router({})

blogRoute.get('/', async (req: RequestWithQuery<QueryBlogModel>, res: Response<Pagination<BlogViewModel>>) => {
  const sortData = {
    searchNameTerm: req.query.searchNameTerm ?? null,
    sortBy: req.query.sortBy ?? 'createdAt',
    sortDirection: req.query.sortDirection ?? 'desc',
    pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
    pageSize: req.query.pageSize ? +req.query.pageSize : 10
  }

  const blogs = await BlogQueryRepository.getAllBlogs(sortData)

  if (!blogs) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(blogs)
})

blogRoute.get('/:id', idValidationMiddleware, async (req: Request<{
  id: string
}>, res: Response<BlogViewModel | boolean>) => {
  const id = req.params.id

  const blog = await BlogQueryRepository.getBlogById(id)

  if (!blog) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(blog)
})

blogRoute.get('/:id/posts', idValidationMiddleware, async (req: RequestWithParamsAndQuery<{
  id: string
}, QueryPostModel>, res: Response<Pagination<PostViewModel>>) => {
  const sortData = {
    sortBy: req.query.sortBy ?? 'createdAt',
    sortDirection: req.query.sortDirection ?? 'desc',
    pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
    pageSize: req.query.pageSize ? +req.query.pageSize : 10
  }

  const id = req.params.id
  const accessToken = req.headers.authorization?.split(' ')[1]

  const posts = await PostQueryRepository.getAllPostsByBlog(id, sortData, accessToken)

  if (!posts) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(posts)
})

blogRoute.post('/', authMiddleware, blogValidation(), async (req: RequestWithBody<CreateBlogModel>, res: Response<BlogViewModel>) => {
  const createBlogModel = {
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
  }

  const createdBlog = await BlogService.createBlog(createBlogModel)

  if (!createdBlog) {
    res.sendStatus(404)
    return
  }

  res.status(201).send(createdBlog)
})

blogRoute.post('/:id/posts', authMiddleware, idValidationMiddleware, createPostFromBlogValidation(), async (req: RequestWithParamsAndBody<{
  id: string
}, CreatePostFromBlogModel>, res: Response<PostViewModel>) => {
  const {title, shortDescription, content} = req.body

  const id = req.params.id

  const createPostFromBlogModel = {
    title,
    shortDescription,
    content
  }

  const post = await BlogService.createPostToBlog(id, createPostFromBlogModel)

  if (!post) {
    res.sendStatus(404)
    return
  }

  res.status(201).send(post)
})

blogRoute.put('/:id', authMiddleware, idValidationMiddleware, blogValidation(), async (req: RequestWithParamsAndBody<{
  id: string
}, UpdateBlogModel>, res: Response<void>) => {
  const id = req.params.id

  const updateBlogMode = {
    name: req.body.name,
    websiteUrl: req.body.websiteUrl,
    description: req.body.description
  }

  const isBlogUpdated = await BlogService.updateBlogById(id, updateBlogMode)

  if (!isBlogUpdated) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})

blogRoute.delete('/:id', authMiddleware, idValidationMiddleware, async (req: Request<{
  id: string
}>, res: Response) => {
  const id = req.params.id

  const isBlogDeleted = await BlogService.deleteBlogById(id)

  if (!isBlogDeleted) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})