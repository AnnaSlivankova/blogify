import {Router, Request, Response} from "express";
import {PostViewModel} from "../models/post-models/output/post-view-model";
import {PostRepository} from "../repositories/post-repository";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {postValidation} from "../validators/post-validators";
import {RequestWithBody, RequestWithParamsAndBody} from "../types";
import {CreatePostModel} from "../models/post-models/input/create-post-model";
import {ObjectId} from "mongodb";
import {PostDb} from "../models/post-models/db/post-db";
import {BlogRepository} from "../repositories/blog-repository";
import {BlogViewModel} from "../models/blog-models/output/blog-view-model";
import {UpdatePostModel} from "../models/post-models/input/update-post-model";

export const postRoute = Router({})

postRoute.get('/', async (req: Request, res: Response<PostViewModel[] | boolean>) => {

  const posts = await PostRepository.getAll()

  if (!posts) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(posts)
})

postRoute.get('/:id', async (req: Request<{ id: string }>, res: Response<PostViewModel | boolean>) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const post = await PostRepository.getPostById(id)

  if (!post) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(post)
})

postRoute.post('/', authMiddleware, postValidation(), async (req: RequestWithBody<CreatePostModel>, res: Response<PostViewModel>) => {
  const blogId = req.body.blogId

  if (!ObjectId.isValid(blogId)) {
    res.sendStatus(404)
    return
  }

  const relevantBlog = await BlogRepository.getById(blogId) as BlogViewModel

  if (!relevantBlog) {
    res.sendStatus(404)
    return
  }

  const newPost: PostDb = {
    title: req.body.title,
    content: req.body.content,
    shortDescription: req.body.shortDescription,
    blogId,
    blogName: relevantBlog.name,
    createdAt: new Date().toISOString()
  }

  const createdPostId = await PostRepository.createPost(newPost)

  if (!createdPostId) {
    res.sendStatus(404)
    return
  }

  const createdPost = await PostRepository.getPostById(createdPostId as string)

  if (!createdPost) {
    res.sendStatus(404)
    return
  }

  res.status(201).send(createdPost as PostViewModel)
})

postRoute.put('/:id', authMiddleware, postValidation(), async (req: RequestWithParamsAndBody<{
  id: string
}, UpdatePostModel>, res: Response) => {
  const postId = req.params.id
  const blogId = req.body.blogId

  if (!ObjectId.isValid(postId) || !ObjectId.isValid(blogId)) {
    res.sendStatus(404)
    return
  }

  const post = await PostRepository.getPostById(postId)
  const blog = await BlogRepository.getById(blogId)

  if (!post || !blog) {
    res.sendStatus(404)
    return
  }

  const isPostUpdate = await PostRepository.updatePost(postId, req.body)

  if (!isPostUpdate) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})

postRoute.delete('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const post = await PostRepository.getPostById(id)

  if (!post) {
    res.sendStatus(404)
    return
  }


  const isPostDeleted = await PostRepository.deletePost(id)

  if (!isPostDeleted) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})