import {Request, Response, Router} from "express";
import {PostViewModel} from "../models/post-models/output/post-view-model";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {postValidation} from "../validators/post-validators";
import {Pagination, RequestWithBody, RequestWithParamsAndBody, RequestWithQuery} from "../types";
import {CreatePostModel} from "../models/post-models/input/create-post-model";
import {ObjectId} from "mongodb";
import {UpdatePostModel} from "../models/post-models/input/update-post-model";
import {PostQueryRepository} from "../repositories/post-query-repository";
import {QueryPostModel} from "../models/post-models/input/query-post-model";
import {PostService} from "../services/post-service";

export const postRoute = Router({})

postRoute.get('/', async (req: RequestWithQuery<QueryPostModel>, res: Response<Pagination<PostViewModel>>) => {
  const {sortDirection, sortBy, pageSize, pageNumber} = req.query

  const sortData = {
    pageNumber: pageNumber ? +pageNumber : 1,
    pageSize: pageSize ? +pageSize : 10,
    sortBy: sortBy ?? 'createdAt',
    sortDirection: sortDirection ?? 'desc'
  }

  const posts = await PostQueryRepository.getAllPosts(sortData)

  if (!posts) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(posts)
})

postRoute.get('/:id', async (req: Request<{ id: string }>, res: Response<PostViewModel>) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const post = await PostQueryRepository.getPostById(id)

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

  const createdPostModel = {
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId
  }

  const post = await PostService.createPost(createdPostModel)

  if (!post) {
    res.sendStatus(404)
    return
  }

  res.status(201).send(post)
})

postRoute.put('/:id', authMiddleware, postValidation(), async (req: RequestWithParamsAndBody<{
  id: string
}, UpdatePostModel>, res: Response<void>) => {
  const postId = req.params.id
  const blogId = req.body.blogId

  if (!ObjectId.isValid(postId) || !ObjectId.isValid(blogId)) {
    res.sendStatus(404)
    return
  }

  const updatePostModel = {
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId
  }

  const isPostUpdated = await PostService.updatePost(postId, updatePostModel)

  if (!isPostUpdated) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})

postRoute.delete('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response<void>) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(404)
    return
  }

  const isPostDeleted = await PostService.deletePost(id)

  if (!isPostDeleted) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})