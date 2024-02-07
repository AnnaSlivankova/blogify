import {PATH} from "../src/app";
import {BlogViewModel} from "../src/models/blog-models/output/blog-view-model";
import {PostViewModel} from "../src/models/post-models/output/post-view-model";
import {MongoClient} from "mongodb";
import {
  blogDTO,
  commonHeaders,
  createPostDTO,
  mongoURI,
  paginatedEmptyResponse,
  req
} from "./tests-settings";


describe('/posts', () => {
  let blog: BlogViewModel
  let post: PostViewModel

  if (!mongoURI) {
    return console.log('invalid mongoURI:', mongoURI)
  }

  const client = new MongoClient(mongoURI)

  beforeAll(async () => {
    await client.connect()

    await req.delete(PATH.TESTING).expect(204)

    const res = await req.post(PATH.BLOGS).set(commonHeaders).send(blogDTO).expect(201)

    blog = res.body
  })

  afterAll(async () => {
    await req.delete(PATH.TESTING).expect(204)
    await client.close()
  })

  it('GET posts should return default pagination values and empty items[]', async () => {
    await req.get(PATH.POSTS).expect(paginatedEmptyResponse)
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
    await req.post(PATH.POSTS).set({'Authorization': 'scj32039wncw'}).set(createPostDTO(blog.id)).expect(401)
  })

  it('POST should create new post', async () => {
    const res = await req.post(PATH.POSTS).set(commonHeaders).send(createPostDTO(blog.id)).expect(201)

    post = res.body

    const {id, content, blogId, title, shortDescription, blogName} = res.body as PostViewModel

    expect(id).toBeDefined()
    expect(content).toStrictEqual(post.content)
    expect(blogId).toStrictEqual(blog.id)
    expect(title).toStrictEqual(post.title)
    expect(shortDescription).toStrictEqual(post.shortDescription)
    expect(blogName).toStrictEqual(blog.name)

    const allPostsFromDB = await req.get(PATH.POSTS)
    expect(allPostsFromDB.body.items.length).toBe(1)
  })

  it('- GET should return 404 when id is not correct', async () => {
    await req.get(`${PATH.POSTS}/incorrect-id`).expect(404)
  })

  it('GET should return post by its id', async () => {
    const res = await req.get(`${PATH.POSTS}/${post.id}`).expect(200)

    expect(res.body.id).toStrictEqual(post.id)
  })

  it('- PUT should return 401', async () => {
    await req.put(`${PATH.POSTS}/${post.id}`).set({'Authorization': 'scj32039wncw'}).send(createPostDTO(post.id)).expect(401)
  })

  it('- PUT should return 404 when blogId is not correct', async () => {
    await req.put(`${PATH.POSTS}/incorrect-id`).set(commonHeaders).send(createPostDTO(blog.id)).expect(404)
  })

  it('- PUT should not update post with incorrect data (title/shortDescription/content/blogId)', async () => {

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
    await req.delete(`${PATH.POSTS}/${post.id}`).set({'Authorization': 'scj32039wncw'}).expect(401)
  })

  it('- DELETE should return 404 when post-id is not found', async () => {
    await req.delete(`${PATH.POSTS}/incorrect-id`).set(commonHeaders).expect(404)
  })

  it('DELETE post by id should return default pagination values and empty items[]', async () => {
    await req.delete(`${PATH.POSTS}/${post.id}`).set(commonHeaders).expect(204)

    await req.get(PATH.POSTS).expect(paginatedEmptyResponse)
  })
})