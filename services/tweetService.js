const helpers = require('../_helpers')

const db = require('../models')
const { sequelize } = db
const { User, Tweet, Like } = db

module.exports = {
  getTweets: async (req, res) => {
    try {
      const offsetCounter = req.params.offset * 25
      const userId = helpers.getUser(req).id
      const tweets = await Tweet.findAll({
        attributes: [
          'id',
          'UserId',
          'description',
          'createdAt',
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
            ),
            'replyCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)'
            ),
            'likeCount'
          ],
          [
            sequelize.literal(
              `(SELECT Likes.UserId FROM Likes WHERE Likes.TweetId = Tweet.id AND Likes.UserId = ${userId})`
            ),
            'isLiked'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'account', 'avatar'],
            require: false
          }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true,
        limit: 25,
        offset: offsetCounter || 0
      })
      return tweets
    } catch (err) {
      console.error(err)
    }
  },

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
