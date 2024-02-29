import 'dotenv/config'
import mongoose from "mongoose";

const dbName = 'blogify-db'
const uri = process.env.MONGO_URL + "/" + dbName

if (!uri) {
  throw new Error('invalid DB uri!')
}

export async function runDb() {
  try {
    await mongoose.connect(uri)
    console.log('Client connected to DB')
  } catch (e) {
    console.log('no connection')
    await mongoose.disconnect()
  }
}