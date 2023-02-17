const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')
const User = require('../models/users')
const { tokenExtractor, userExtractor } = require('../utils/middleware')
require('express-async-errors')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post(
  '/',
  tokenExtractor,
  userExtractor,
  async (request, response, next) => {
    const { title, author, url, likes } = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = request.user

    const blog = new Blog({
      title: title,
      author: author,
      url: url,
      likes: likes,
      user: user.id,
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  }
)

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  response.json(blog)
})

blogsRouter.delete(
  '/:id',
  tokenExtractor,
  userExtractor,
  async (request, response, next) => {
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const id = request.params.id
    const blog = await Blog.findById(id)
    if (blog.user.toString() === decodedToken.id) {
      await Blog.findByIdAndRemove(id)
      response.status(204).end()
    } else {
      response.status(401).json({ error: 'Invalid token' })
    }
  }
)

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    likes: body.likes,
  }

  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.status(200).end()
})

module.exports = blogsRouter
