const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../bloglist/app')
const helper = require('./test_helper')
const api = supertest(app)

const Blog = require('../models/blogs')
const User = require('../models/users')

let token

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
  const newUser = {
    username: 'Dennis',
    name: 'Dennis',
    password: 'password',
  }

  await api.post('/api/users').send(newUser)

  const result = await api.post('/api/login').send(newUser)

  token = `Bearer ${result.body.token}`
})
describe('Test of blog function', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('There is an id identifier', async () => {
    const response = await api.get('/api/blogs')
    const ids = response.body.map((r) => r.id)
    expect(ids).toBeDefined()
  })

  test('Add blog', async () => {
    const newBlog = {
      title: 'Added blog',
      author: 'Dennis',
      url: 'http://test.com',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map((r) => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain('Added blog')
  })
  test('Add blog without authorization', async () => {
    const newBlog = {
      title: 'Added blog',
      author: 'Dennis',
      url: 'http://test.com',
      likes: 5,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)
  })
  test('Add blog without defined likes', async () => {
    const newBlog = {
      title: 'Added test blog',
      author: 'Dennis',
      url: 'http://test.com',
    }

    await api.post('/api/blogs').send(newBlog).set('Authorization', token)

    const response = await api.get('/api/blogs')
    const likes = response.body.map((r) => r.likes)

    expect(likes).toContain(0)
  })

  test('Add without Title or Url', async () => {
    const newBlog = {
      author: 'Dennis',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(400)
  })

  test('Update blog', async () => {
    const blogs = await helper.blogsInDb()
    const blogItem = blogs[0]
    const updatedBlog = {
      likes: 10,
    }
    await api.put(`/api/blogs/${blogItem.id}`).send(updatedBlog).expect(200)
    const response = await api.get(`/api/blogs/${blogItem.id}`)
    expect(response.body.likes).toBe(10)
  })

  test('Delete blog', async () => {
    const newBlog = {
      title: 'Test item',
      author: 'Dennis',
      url: 'http://test.com',
      likes: 7,
    }

    await api.post('/api/blogs').send(newBlog).set('Authorization', token)

    const blogs = await helper.blogsInDb()
    const blogItem = blogs.pop()
    await api
      .delete(`/api/blogs/${blogItem.id}`)
      .set('Authorization', token)
      .expect(204)

    const blogsAfterDeletion = await helper.blogsInDb()
    expect(blogsAfterDeletion).toHaveLength(helper.initialBlogs.length)
    const remaining = blogsAfterDeletion.map((r) => r.title)
    expect(remaining).not.toContain(blogItem.title)
  })
})
describe('Test of user function', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(helper.initialUsers)
  })

  test('User creation', async () => {
    const newUser = {
      username: 'Bertil Boo',
      name: 'Bertil',
      password: 'berrabosse',
    }
    await api.post('/api/users').send(newUser).expect(201)
    const response = await api.get('/api/users')
    const usernames = response.body.map((r) => r.username)

    expect(response.body).toHaveLength(helper.initialUsers.length + 1)
    expect(usernames).toContain('Bertil Boo')
  })
  test('Unique error test', async () => {
    const newUser = {
      username: 'Dennis Josefsson',
      name: 'DJ',
      password: 'password',
    }
    const data = await api.post('/api/users').send(newUser).expect(400)

    expect(data.body.error).toContain('User validation failed')
  })
  test('No password', async () => {
    const newUser = {
      username: 'Stig Strömholm',
      name: 'Stickan',
      password: '',
    }

    const data = await api.post('/api/users').send(newUser).expect(400)

    expect(data.body.error).toContain('Must provide password')
  })
  test('Short password', async () => {
    const newUser = {
      username: 'Stig Strömholm',
      name: 'Stickan',
      password: 'pw',
    }
    const data = await api.post('/api/users').send(newUser).expect(400)

    expect(data.body.error).toContain(
      'Password must be at least 3 characters long'
    )
  })
  test('No Username', async () => {
    const newUser = {
      username: '',
      name: 'Stickan',
      password: 'password',
    }
    const data = await api.post('/api/users').send(newUser).expect(400)

    expect(data.body.error).toContain('User validation failed')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
