const helpers = require('../_helpers')

const db = require('../models')
const { Like } = db

const tweetService = {
  addLike: async (req, res, callback) => {
    try {
      await Like.findOrCreate({
        where: {
          UserId: helpers.getUser(req).id,
          TweetId: req.params.tweetId
        }
      })
      const result = { status: 'success', message: '成功按讚' }
      return callback(result)
    } catch (err) {
      console.error(err)
    }
  },

  removeLike: async (req, res, callback) => {
    try {
      await Like.destroy({
        where: {
          UserId: helpers.getUser(req).id,
          TweetId: req.params.tweetId
        }
      })
      const result = { status: 'success', message: '成功取消按讚' }
      return callback(result)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = tweetService
