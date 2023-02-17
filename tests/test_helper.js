const Blog = require('../models/blogs')

const initialBlogs = [
  {
    title: 'Test Item 1',
    author: 'Dennis Josefsson',
    url: 'http://test.com',
    likes: 5,
  },
  {
    title: 'Test Item 2',
    author: 'Yogi Berra',
    url: 'http://yogiberra.com',
    likes: 5,
  },
]

const initialUsers = [
  { username: 'Dennis Josefsson', name: 'Dennis', password: 'password' },
  { username: 'Yogi Berra', name: 'Yogi', password: 'yoghurt' },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  initialUsers,
}
