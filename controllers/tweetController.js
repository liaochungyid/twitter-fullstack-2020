const helpers = require('../_helpers')
const constants = require('../config/constants')

const db = require('../models')
const { User, Tweet, Reply, Like } = db
const tweetTime = require('../utils/tweetTime')

const notificationService = require('../services/notificationService')
const tweetService = require('../services/tweetService')
const userService = require('../services/userService')

module.exports = {
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

  indexPage: (req, res) => {
    if (helpers.getUser(req).role === 'admin') {
      req.flash('errorMessage', '你無法瀏覽此頁面')
      return res.redirect('/admin/tweets')
    }
    return res.render('user', { partial: 'tweets' })
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
