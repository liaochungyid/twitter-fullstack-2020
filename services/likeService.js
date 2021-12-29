const helpers = require('../_helpers')
const query = require('../repositories/query')

const db = require('../models')
const { Tweet, Like } = db

module.exports = {
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
  },

  getUserLikes: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      const likes = await Like.findAll({
        where: { UserId: userId },
        attributes: ['createdAt'],
        include: [
          {
            model: Tweet,
            attributes: [
              'id',
              'description',
              'createdAt',
              [query.getTweetReplyCount(), 'replyCount'],
              [query.getTweetLikeCount(), 'likeCount'],
              [query.getTweetIsLiked(helpers.getUser(req).id), 'isLiked']
            ],
            require: false
          }
        ],
        raw: true,
        nest: true
      })
      const tweets = likes
        .map(like => ({
          id: like.Tweet.id,
          description: like.Tweet.description,
          replyCount: like.Tweet.replyCount,
          likeCount: like.Tweet.likeCount,
          isLiked: like.Tweet.isLiked,
          likeCreatedAt: like.createdAt
        }))
        .sort((a, b) => b.likeCreatedAt - a.likeCreatedAt)
      return tweets
    } catch (err) {
      console.error(err)
    }
  }
}
