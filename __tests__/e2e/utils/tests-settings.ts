import {app, PATH, SETTINGS} from "../../../src/app";
import {agent} from "supertest";
// import 'dotenv/config'
import {CreateBlogModel} from "../../../src/models/blog-models/input/create-blog-model";
import {CreatePostModel} from "../../../src/models/post-models/input/create-post-model";
import {BlogViewModel} from "../../../src/models/blog-models/output/blog-view-model";

export const req = agent(app)

export const commonHeaders = {
  "authorization": `Basic ${SETTINGS.AUTH_CRED}`
}


//todo убрать mongoURI - не нужное вроде проверить в тестах blog/post

// export const mongoURI = process.env.MONGO_URL
export const mongoURI = SETTINGS.MONGO_URL

export const paginatedEmptyResponse = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: []
} as const

export const blogDTO: CreateBlogModel = {
  name: 'correct name',
  description: 'correct description',
  websiteUrl: 'https://correct-url.com'
}

export const createPostDTO = (blogId: string): CreatePostModel => {
  return {
    blogId,
    content: 'some content',
    title: 'some title',
    shortDescription: 'some short description'
  }
}

export const createBlogsDTO = async (count: number): Promise<BlogViewModel[]> => {
  let blogsDTO: BlogViewModel[] = []

  for (let i = 0; i < count; i++) {
    const res = await req.post(PATH.BLOGS).set(commonHeaders).send({
      name: `${i + 1}name`,
      description: 'correct description',
      websiteUrl: 'https://correct-url.com'
    })

    blogsDTO.push(res.body)
  }

  return blogsDTO
}