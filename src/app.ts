import express, {json} from "express";
import {blogRoute} from "./routes/blog-route";
import {postRoute} from "./routes/post-route";
import {testingAllDataRoute} from "./routes/testing-all-data-route";

export const app = express()

app.use(json())

app.use('/blogs', blogRoute)

app.use('/posts', postRoute)

app.use('/testing/all-data', testingAllDataRoute)