export const db: DBType = {
  blogs: [],
  posts: []
}

type DBType = {
  blogs: BlogDB[]
  posts: PostDB[]
}

export type BlogDB = {
  id: string
  name: string
  description: string
  websiteUrl: string
}

export type PostDB = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
}