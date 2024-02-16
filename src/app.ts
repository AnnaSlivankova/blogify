import express, {json} from "express";
import {blogRoute} from "./routes/blog-route";
import {postRoute} from "./routes/post-route";
import {testingAllDataRoute} from "./routes/testing-all-data-route";
import 'dotenv/config'
import {userRoute} from "./routes/user-route";
import {authRoute} from "./routes/auth-route";
import {commentRoute} from "./routes/comment-route";
import cookieParser from "cookie-parser";

export const SETTINGS = {
  PORT: process.env.PORT,
  AUTH_CRED: process.env.AUTH_CRED,
  LOGIN_CRED: process.env.LOGIN_CRED as string,
  PASS_CRED: process.env.PASS_CRED as string,
  JWT_SECRET: process.env.JWT_SECRET,

  MONGO_URL: process.env.MONGO_URL as string,

  CORP_EMAIL: process.env.CORP_EMAIL,
  CORP_PASS: process.env.CORP_PASS
}

export const PATH = {
  BLOGS: '/blogs',
  POSTS: '/posts',
  USERS: '/users',
  AUTH: '/auth',
  COMMENTS: '/comments',
  TESTING: '/testing/all-data'
} as const

export const app = express()

app.use(json())
app.use(cookieParser())

app.use(PATH.BLOGS, blogRoute)

app.use(PATH.POSTS, postRoute)

app.use(PATH.USERS, userRoute)

app.use(PATH.AUTH, authRoute)

app.use(PATH.COMMENTS, commentRoute)

app.use(PATH.TESTING, testingAllDataRoute)
