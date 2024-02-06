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
}

export const app = express()

app.use(json())

app.use('/blogs', blogRoute)

app.use('/posts', postRoute)

app.use('/testing/all-data', testingAllDataRoute)

