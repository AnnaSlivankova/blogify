import {Request, Response, Router} from "express";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {blogValidation} from "../validators/blog-validators";
import {BlogRepository} from "../repositories/blog-repository";
import {RequestWithBody, RequestWithParamsAndBody} from "../types";
import {BlogViewModel} from "../models/blog-models/output/blog-view-model";
import {CreateBlogModel} from "../models/blog-models/input/create-blog-model";
import {UpdateBlogModel} from "../models/blog-models/input/update-blog-model";
import {ObjectId} from "mongodb";
import {BlogDb} from "../models/blog-models/db/blog-db";

export const blogRoute = Router({})

blogRoute.get('/', async (req: Request, res: Response<BlogViewModel[] | boolean>) => {
  const blogs = await BlogRepository.getAll()

  if (!blogs) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(blogs)
})

blogRoute.get('/:id', async (req: Request<{ id: string }>, res: Response<BlogViewModel | boolean>) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const blog = await BlogRepository.getById(id)

  if (!blog) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(blog)
})

blogRoute.post('/', authMiddleware, blogValidation(), async (req: RequestWithBody<CreateBlogModel>, res: Response<BlogViewModel | boolean | null>) => {
  const newBlog: BlogDb = {
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false
  }

  const createdBlog = await BlogRepository.createBlog(newBlog)

  if (!createdBlog) {
    res.sendStatus(404)
    return
  }

  res.status(201).send(createdBlog)
})

blogRoute.put('/:id', authMiddleware, blogValidation(), async (req: RequestWithParamsAndBody<{
  id: string
}, UpdateBlogModel>, res: Response<void>) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const blog = await BlogRepository.getById(id)

  if (!blog) {
    res.sendStatus(404)
    return
  }

  const isBlogUpdated = await BlogRepository.updateBlog(id, req.body)

  if (!isBlogUpdated) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})

blogRoute.delete('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const blog = await BlogRepository.getById(id)

  if (!blog) {
    res.sendStatus(404)
    return
  }

  const isBlogDeleted = await BlogRepository.deleteBlog(req.params.id)

  if (!isBlogDeleted) {
    res.sendStatus(400)
    return
  }

  res.sendStatus(204)
})