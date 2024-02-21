import {
  apiRequestsHistoryCollection,
  blogsCollection,
  commentsCollection,
  deviceAuthSessionsCollection,
  postsCollection,
  usersCollection
} from "../db/db";

export class TestingAllDataRepository {
  static async deleteAllData() {
    try {
      await Promise.all([
        blogsCollection.deleteMany({}),
        postsCollection.deleteMany({}),
        usersCollection.deleteMany({}),
        commentsCollection.deleteMany({}),
        deviceAuthSessionsCollection.deleteMany({}),
        apiRequestsHistoryCollection.deleteMany({}),
      ])

      return
    } catch (e) {
      console.log('e', e)
      return
    }

    // await blogsCollection.deleteMany({})
    // await postsCollection.deleteMany({})
    // await usersCollection.deleteMany({})
    // await commentsCollection.deleteMany({})
    // await deviceAuthSessionsCollection.deleteMany({})

    // await db.dropDatabase() //но нужны админские права для дропа всей БД
  }

}