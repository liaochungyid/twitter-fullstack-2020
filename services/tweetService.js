const helpers = require('../_helpers')
const constants = require('../config/constants')

const db = require('../models')
const { sequelize } = db
const { User, Tweet } = db

module.exports = {
  getTweets: async (req, res) => {
    try {
      const offsetCounter = req.params.offset * constants.tweetsPerPage
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
        limit: constants.tweetsPerPage,
        offset: offsetCounter || 0
      })
      return tweets
    } catch (err) {
      console.error(err)
    }
  }
}
