import {PostDb} from "../models/post-models/db/post-db";
import {MongoClient} from "mongodb";
import {BlogDb} from "../models/blog-models/db/blog-db";
import 'dotenv/config'
import {SETTINGS} from "../app";

const uri = process.env.MONGO_URL

if (!uri) {
  throw new Error('invalid DB uri!')
}

const client = new MongoClient(uri)

export const db = client.db('blogify-db')

export const blogsCollection = db.collection<BlogDb>('blogs')
export const postsCollection = db.collection<PostDb>('posts')

export const runDB = async () => {
  try {
    await client.connect()

    console.log('Client connected to DB')
    console.log(`App listening on port ${SETTINGS.PORT}`)
  } catch (e) {
    console.log(e)
  }
}