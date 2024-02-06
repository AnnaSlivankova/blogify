import express, {json} from "express";
import {blogRoute} from "./routes/blog-route";
import {postRoute} from "./routes/post-route";
import {testingAllDataRoute} from "./routes/testing-all-data-route";
import 'dotenv/config'

export const SETTINGS = {
  PORT: process.env.PORT,
  AUTH_CRED: process.env.AUTH_CRED,
  LOGIN_CRED: process.env.LOGIN_CRED,
  PASS_CRED: process.env.PASS_CRED,
} as const

export const PATH = {
  BLOGS: '/blogs',
  POSTS: '/posts',
  TESTING: '/testing/all-data'
} as const

export const app = express()

app.use(json())

app.use(PATH.BLOGS, blogRoute)

app.use(PATH.POSTS, postRoute)

app.use(PATH.TESTING, testingAllDataRoute)

