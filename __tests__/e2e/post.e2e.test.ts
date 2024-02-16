import {PATH, SETTINGS} from "../../src/app";
import {MongoClient} from "mongodb";
import {commonHeaders, req} from "../tests-settings";
import {MongoMemoryServer} from "mongodb-memory-server";
import {paginatedEmptyResponse, testSeeder} from "../test.seeder";


describe('POSTS_E2E', () => {
  let client: MongoClient

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    SETTINGS.MONGO_URL = mongoServer.getUri()
    client = new MongoClient(SETTINGS.MONGO_URL)
    await client.connect()
  })

  beforeEach(async () => {
    await req.delete(PATH.TESTING).expect(204)
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await client.close()
  })

  it('GET posts should return default pagination values and empty items[]', async () => {
    await req.get(PATH.POSTS).expect(paginatedEmptyResponse)
  })

  it('- POST should return 401', async () => {
    await req.post(PATH.POSTS).set({'Authorization': 'scj32039wncw'}).send({}).expect(401)
  })

  it('- POST should not create post with incorrect data (title/shortDescription/content/blogId)', async () => {
    const res = await req.post(PATH.POSTS).set(commonHeaders).send({
      title: '',
      content: '   ',
      blogId: 'invalid blogId value'
    }).expect(400)

    expect(res.body.errorsMessages.length).toBe(4)
    expect(res.body.errorsMessages[0].field).toStrictEqual("title")
    expect(res.body.errorsMessages[1].field).toStrictEqual("shortDescription")
    expect(res.body.errorsMessages[2].field).toStrictEqual("content")
    expect(res.body.errorsMessages[3].field).toStrictEqual("blogId")
  })

  it('POST should create new post', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    const res = await req.post(PATH.POSTS).set(commonHeaders).send(testSeeder.createPostDto(blog.id)).expect(201)

    expect(res.body.id).toBeDefined()
    expect(res.body.blogName).toStrictEqual(blog.name)

    const allPostsFromDB = await req.get(PATH.POSTS)
    expect(allPostsFromDB.body.items.length).toBe(1)
  })

  it('- GET should return 404 when id is not correct', async () => {
    await req.get(`${PATH.POSTS}/incorrect-id`).expect(404)
  })

  it('GET should return post by its id', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    const post = await testSeeder.createPostDtoInDb(blog.id)

    const res = await req.get(`${PATH.POSTS}/${post.id}`).expect(200)

    expect(res.body.id).toStrictEqual(post.id)
  })

  it('- PUT should return 401', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    const post = await testSeeder.createPostDtoInDb(blog.id)
    await req.put(`${PATH.POSTS}/${post.id}`).set({'Authorization': 'scj32039wncw'}).send({}).expect(401)
  })

  it('- PUT should return 404 when blogId is not correct', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    await req.put(`${PATH.POSTS}/incorrect-id`).set(commonHeaders).send(testSeeder.createPostDto(blog.id)).expect(404)
  })

  it('- PUT should not update post with incorrect data (title/shortDescription/content/blogId)', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    const post = await testSeeder.createPostDtoInDb(blog.id)

    const res = await req.put(`${PATH.POSTS}/${post.id}`).set(commonHeaders).send({
      blogId: blog.id,
      content: '',
      title: '   ',
    }).expect(400)

    expect(res.body.errorsMessages.length).toBe(3)
    expect(res.body.errorsMessages[0].field).toStrictEqual("title")
    expect(res.body.errorsMessages[1].field).toStrictEqual("shortDescription")
    expect(res.body.errorsMessages[2].field).toStrictEqual("content")
  })

  it('PUT should update post by id', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    const post = await testSeeder.createPostDtoInDb(blog.id)

    await req.put(`${PATH.POSTS}/${post.id}`).set(commonHeaders).send({
      blogId: blog.id,
      content: 'updated content',
      title: 'updated title',
      shortDescription: 'updated short description'
    }).expect(204)

    const res = await req.get(`${PATH.POSTS}/${post.id}`).expect(200)

    expect(res.body.blogId).toStrictEqual(blog.id)
    expect(res.body.content).toStrictEqual('updated content')
    expect(res.body.title).toStrictEqual('updated title')
    expect(res.body.shortDescription).toStrictEqual('updated short description')
  })

  it('- DELETE should return 401', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    const post = await testSeeder.createPostDtoInDb(blog.id)
    await req.delete(`${PATH.POSTS}/${post.id}`).set({'Authorization': 'scj32039wncw'}).expect(401)
  })

  it('- DELETE should return 404 when post-id is not found', async () => {
    await req.delete(`${PATH.POSTS}/incorrect-id`).set(commonHeaders).expect(404)
  })

  it('DELETE post by id should return default pagination values and empty items[]', async () => {
    const blog = await testSeeder.createBlogDtoInDb()
    const post = await testSeeder.createPostDtoInDb(blog.id)
    await req.delete(`${PATH.POSTS}/${post.id}`).set(commonHeaders).expect(204)

    await req.get(PATH.POSTS).expect(paginatedEmptyResponse)
  })
})