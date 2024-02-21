import {PostDb} from "../models/post-models/db/post-db";
import {MongoClient} from "mongodb";
import {BlogDb} from "../models/blog-models/db/blog-db";
import 'dotenv/config'
import {SETTINGS} from "../app";
import {UserDb} from "../models/user-models/db/user-db";
import {CommentDb} from "../models/comment-models/db/comment-db";
import {DeviceAuthSessionsDb} from "../models/device-auth-sessions-models/db/device-auth-sessions-db";
import {ApiRequestsHistoryDb} from "../models/device-auth-sessions-models/db/api-requests-history-db";

const uri = process.env.MONGO_URL

if (!uri) {
  throw new Error('invalid DB uri!')
}

const client = new MongoClient(uri)

export const db = client.db('blogify-db')

export const blogsCollection = db.collection<BlogDb>('blogs')
export const postsCollection = db.collection<PostDb>('posts')
export const usersCollection = db.collection<UserDb>('users')
export const commentsCollection = db.collection<CommentDb>('comments')
export const deviceAuthSessionsCollection = db.collection<DeviceAuthSessionsDb>('deviceAuthSessions')
export const apiRequestsHistoryCollection = db.collection<ApiRequestsHistoryDb>('apiRequestsHistory')

export const runDB = async () => {
  try {
    await client.connect()

    console.log('Client connected to DB')
    console.log(`App listening on port ${SETTINGS.PORT}`)
  } catch (e) {
    console.log(e)
  }
}