import {Request, Response, Router} from "express";
import {PostViewModel} from "../models/post-models/output/post-view-model";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {postValidation} from "../validators/post-validators";
import {
  Pagination,
  RequestWithBody,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../types";
import {CreatePostModel} from "../models/post-models/input/create-post-model";
import {ObjectId} from "mongodb";
import {UpdatePostModel} from "../models/post-models/input/update-post-model";
import {PostQueryRepository} from "../repositories/post-query-repository";
import {QueryPostModel} from "../models/post-models/input/query-post-model";
import {PostService} from "../services/post-service";
import {CreateCommentModel} from "../models/comment-models/input/create-comment-model";
import {commentValidation} from "../validators/comment-validators";
import {authJwtMiddleware} from "../middlewares/auth/auth-jwt-middleware";
import {CommentService} from "../services/comment-service";
import {QueryCommentModal} from "../models/comment-models/input/query-comment-modal";
import {CommentQueryRepository} from "../repositories/comment-query-repository";
import {CommentViewModel} from "../models/comment-models/output/CommentViewModel";
import {PostRepository} from "../repositories/post-repository";
import {idValidationMiddleware} from "../middlewares/id-validation-middleware";

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

postRoute.get('/:id', idValidationMiddleware, async (req: Request<{ id: string }>, res: Response<PostViewModel>) => {
  const id = req.params.id

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

postRoute.delete('/:id', authMiddleware, idValidationMiddleware, async (req: Request<{
  id: string
}>, res: Response<void>) => {
  const id = req.params.id

  const isPostDeleted = await PostService.deletePost(id)

  if (!isPostDeleted) {
    res.sendStatus(404)
    return
  }

  res.sendStatus(204)
})

postRoute.post('/:id/comments', authJwtMiddleware, idValidationMiddleware, commentValidation(), async (req: RequestWithParamsAndBody<{
  id: string
}, CreateCommentModel>, res: Response) => {
  const postId = req.params.id

  const newComment = {
    content: req.body.content
  }

  const createdComment = await CommentService.createComment(postId, newComment, req.user!._id)

  if (!createdComment) {
    res.sendStatus(404)
    return
  }

  return res.status(201).send(createdComment)
})

postRoute.get('/:id/comments', idValidationMiddleware, async (req: RequestWithParamsAndQuery<{
  id: string
}, QueryCommentModal>, res: Response<Pagination<CommentViewModel>>) => {
  const sortData = {
    pageNumber: req.query.pageNumber ? +req.query.pageNumber : 1,
    pageSize: req.query.pageSize ? +req.query.pageSize : 10,
    sortBy: req.query.sortBy ?? 'createdAt',
    sortDirection: req.query.sortDirection ?? 'desc'
  }

  const id = req.params.id

  const post = await PostRepository.getPostById(id)
  if (!post) {
    res.sendStatus(404)
    return
  }

  const comments = await CommentQueryRepository.getComments(id, sortData)

  if (!comments) {
    res.sendStatus(404)
    return
  }

  res.status(200).send(comments)
})