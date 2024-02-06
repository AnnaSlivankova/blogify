import {app, PATH, SETTINGS} from "../src/app";
import 'dotenv/config'
import {agent} from "supertest";
import {BlogViewModel} from "../src/models/blog-models/output/blog-view-model";
import {PostViewModel} from "../src/models/post-models/output/post-view-model";
import {CreatePostModel} from "../src/models/post-models/input/create-post-model";
import {MongoClient} from "mongodb";

const req = agent(app)

const commonHeaders = {
  "authorization": `Basic ${SETTINGS.AUTH_CRED}`
}

const mongoURI = process.env.MONGO_URL

describe('/posts', () => {
  let blog: BlogViewModel
  let createdPost: PostViewModel

  if (!mongoURI) {
    return console.log('invalid mongoURI:', mongoURI)
  }

  const client = new MongoClient(mongoURI)

  beforeAll(async () => {
    await client.connect()

    await req.delete(PATH.TESTING).expect(204)

    const res = await req.post(PATH.BLOGS).set(commonHeaders).send({
      name: 'some blog name',
      description: 'from post tests',
      websiteUrl: 'https://some-blog-url.com'
    }).expect(201)

    blog = res.body
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await client.close()
  })

  it('GET posts = []', async () => {
    await req.get(PATH.POSTS).expect([])
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

  it('- POST should return 401', async () => {
    await req.post(PATH.POSTS).expect(401)
  })

  it('POST should create new post', async () => {

    const newPost: CreatePostModel = {
      blogId: blog.id,
      content: 'some content',
      title: 'some title',
      shortDescription: 'some short description'
    }

    const res = await req.post(PATH.POSTS).set(commonHeaders).send(newPost).expect(201)

    createdPost = res.body

    const {id, content, blogId, title, shortDescription, blogName} = res.body as PostViewModel

    expect(id).toBeDefined()
    expect(content).toStrictEqual(newPost.content)
    expect(blogId).toStrictEqual(blog.id)
    expect(title).toStrictEqual(newPost.title)
    expect(shortDescription).toStrictEqual(newPost.shortDescription)
    expect(blogName).toStrictEqual(blog.name)

    const res2 = await req.get(PATH.POSTS)
    expect(res2.body.length).toBe(1)
  })

  it('- GET should return 404 when id is not correct', async () => {
    await req.get(`${PATH.POSTS}/incorrect-id`).expect(404)
  })

  it('GET should return post by its id', async () => {
    const res = await req.get(`${PATH.POSTS}/${createdPost.id}`).expect(200)

    expect(res.body.id).toStrictEqual(createdPost.id)
  })

  it('- PUT should return 401', async () => {
    await req.put(`${PATH.POSTS}/${createdPost.id}`).expect(401)
  })

  it('- PUT should return 404 when blogId is not correct', async () => {
    await req.put(`${PATH.POSTS}/incorrect-id`).set(commonHeaders).send({
      blogId: blog.id,
      content: 'some content',
      title: 'some title',
      shortDescription: 'some short description'
    }).expect(404)
  })

  it('- PUT should not update post with incorrect data (title/shortDescription/content/blogId)', async () => {

    const res = await req.put(`${PATH.POSTS}/${createdPost.id}`).set(commonHeaders).send({
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

    await req.put(`${PATH.POSTS}/${createdPost.id}`).set(commonHeaders).send({
      blogId: blog.id,
      content: 'updated content',
      title: 'updated title',
      shortDescription: 'updated short description'
    }).expect(204)

    const res = await req.get(`${PATH.POSTS}/${createdPost.id}`).expect(200)

    expect(res.body.blogId).toStrictEqual(blog.id)
    expect(res.body.content).toStrictEqual('updated content')
    expect(res.body.title).toStrictEqual('updated title')
    expect(res.body.shortDescription).toStrictEqual('updated short description')
  })

  it('- DELETE should return 401', async () => {
    await req.delete(`${PATH.POSTS}/${createdPost.id}`).expect(401)
  })

  it('- DELETE should return 404 when post-id is not found', async () => {
    await req.delete(`${PATH.POSTS}/incorrect-id`).set(commonHeaders).expect(404)
  })

  it('DELETE post by id', async () => {
    await req.delete(`${PATH.POSTS}/${createdPost.id}`).set(commonHeaders).expect(204)

    await req.get(PATH.POSTS).expect([])
  })

})