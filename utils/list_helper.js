const lodashMethods = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    const sum = blogs.reduce((sum, item) => sum + item.likes, 0)
    return sum
  }
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return {}
  } else {
    const favorite = blogs.reduce(
      (fav, post) => (fav.likes > post.likes ? fav : post),
      0
    )
    return favorite
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {}
  } else {
    const authorArray = Object.entries(lodashMethods.countBy(blogs, 'author'))
    const maxValue = authorArray.reduce(
      (max, current) => (max[1] > current[1] ? max : current),
      0
    )
    return { author: maxValue[0], blogs: maxValue[1] }
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {}
  } else {
    const obj = {}
    Object.values(lodashMethods.groupBy(blogs, 'author')).forEach((item) => {
      const result = item.reduce((sum, arr) => sum + arr.likes, 0)

      obj[item[0].author] = result
    })
    const maxValue = Object.entries(obj).reduce(
      (max, current) => (max[1] > current[1] ? max : current),
      0
    )
    return { author: maxValue[0], likes: maxValue[1] }
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
