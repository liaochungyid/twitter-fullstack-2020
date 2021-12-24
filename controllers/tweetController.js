const helpers = require('../_helpers')
const db = require('../models')
const { sequelize } = db
const { User, Tweet, Reply, Like } = db
const tweetTime = require('../utils/tweetTime')
const userController = require('./userController')

const tweetService = require('../services/tweetService')

module.exports = {
  getTweets: async (req, res) => {
    try {
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
        nest: true
      })
      return tweets
    } catch (err) {
      console.error(err)
    }
  },

  addTweet: async (req, res) => {
    try {
      const { description } = req.body

      if (description.length > 140 || !description.length) {
        return res.redirect('back')
      }

      await Tweet.create({ UserId: helpers.getUser(req).id, description })
      return res.redirect('/tweets')
    } catch (err) {
      console.error(err)
    }
  },

  addLike: (req, res) => {
    tweetService.addLike(req, res, data => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },

  removeLike: (req, res) => {
    tweetService.removeLike(req, res, data => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },

  getTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.tweetId, {
        include: [User, Like]
      })
      tweet.dataValues.time = tweetTime.time(tweet.dataValues.createdAt)
      tweet.dataValues.date = tweetTime.date(tweet.dataValues.createdAt)

      const replies = await Reply.findAll({
        where: { TweetId: tweet.id },
        include: [{ model: User, attributes: { exclude: ['password'] } }],
        order: [['createdAt', 'DESC']]
      })

      const userId = helpers.getUser(req).id
      const isLiked = !!(await Like.findOne({
        where: { UserId: userId, TweetId: req.params.tweetId }
      }))

      return res.render('user', {
        tweet: tweet.toJSON(),
        replies: replies.map(reply => reply.toJSON()),
        isLiked,
        partial: 'tweet'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
