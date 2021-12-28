const helpers = require('../_helpers')
const constants = require('../config/constants')

const db = require('../models')
const { sequelize } = db
const { User, Tweet, Reply, Like } = db
const tweetTime = require('../utils/tweetTime')

const notificationService = require('../services/notificationService')
const tweetService = require('../services/tweetService')
const userService = require('../services/userService')

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

      if (
        description.length > constants.maxTweetLength ||
        !description.length
      ) {
        return res.redirect('back')
      }

      await Tweet.create({ UserId: helpers.getUser(req).id, description })
      return res.redirect('/tweets')
    } catch (err) {
      console.error(err)
    }
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
  },

  indexPage: async (req, res) => {
    try {
      if (helpers.getUser(req).role === 'admin') {
        req.flash('errorMessage', '你無法瀏覽此頁面')
        return res.redirect('/admin/tweets')
      }

      return res.render('user', { partial: 'tweets' })
    } catch (err) {
      console.error(err)
    }
  },

  tweetsPage: async (req, res) => {
    try {
      const [user, tweets, isNotified] = await Promise.all([
        userService.getUserProfile(req, res),
        tweetService.getUserTweets(req, res),
        notificationService.getUserIsNotified(req, res)
      ])

      return res.render('user', {
        user,
        tweets,
        isNotified,
        partial: 'profileTweets'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
