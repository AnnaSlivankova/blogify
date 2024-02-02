import {Router, Request, Response} from "express";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {blogValidation} from "../validators/blog-validators";
import {BlogRepository} from "../repositories/blog-repository";
import {BlogViewModel} from "../models/blog-models/BlogViewModel";
import {RequestWithBody, RequestWithParamsAndBody} from "../types";
import {CreateBlogModel} from "../models/blog-models/CreateBlogModel";
import {UpdateBlogModel} from "../models/blog-models/UpdateBlogModel";

export const blogRoute = Router({})

blogRoute.get('/', (req: Request, res: Response<BlogViewModel[]>) => {

  const blogs = BlogRepository.getAll()

  res.status(200).send(blogs)
})

blogRoute.post('/', authMiddleware, blogValidation(), (req: RequestWithBody<CreateBlogModel>, res: Response<BlogViewModel>) => {

  const createdBlog = BlogRepository.createBlog(req.body)

  res.status(201).send(createdBlog)
})

blogRoute.get('/:id', (req: Request<{ id: string }>, res: Response<BlogViewModel>) => {

  const blog = BlogRepository.getById(req.params.id)

  if (!blog) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(blog)
})

blogRoute.put('/:id', authMiddleware, blogValidation(), (req: RequestWithParamsAndBody<{
  id: string
}, UpdateBlogModel>, res: Response) => {

  if (!BlogRepository.getById(req.params.id)) {
    res.sendStatus(404)
    return
  }

  BlogRepository.updateBlog({id: req.params.id, updateData: req.body})

  res.sendStatus(204)
})

blogRoute.delete('/:id', authMiddleware, (req: Request<{ id: string }>, res: Response) => {

  if (!BlogRepository.getById(req.params.id)) {
    res.sendStatus(404)
    return
  }

  BlogRepository.deleteBlog(req.params.id)

  res.sendStatus(204)
})