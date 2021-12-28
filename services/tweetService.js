const helpers = require('../_helpers')
const utility = require('../utils/utility')
const constants = require('../config/constants')
const query = require('../repositories/query')
const moment = require('moment')

const db = require('../models')
const { sequelize } = db
const { User, Tweet, Reply } = db

module.exports = {
  addTweet: async (req, res, callback) => {
    try {
      const userId = helpers.getUser(req).id
      const { description } = req.body
      let result

      if (
        description.length > constants.maxTweetLength ||
        !description.length
      ) {
        result = { status: 'error', message: '無法新增推文' }
      } else {
        await Tweet.create({ UserId: userId, description })
        result = { status: 'success', message: '成功新增推文' }
      }

      return callback(result)
    } catch (err) {
      console.error(err)
    }
  },

  getTweet: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      const tweetId = req.params.tweetId

      const tweetPromise = Tweet.findByPk(tweetId, {
        attributes: {
          include: [
            [query.getTweetLikeCount(), 'likeCount'],
            [query.getTweetIsLiked(userId), 'isLiked']
          ]
        },
        include: [
          { model: User, attributes: { exclude: constants.privateData } }
        ],
        raw: true,
        nest: true
      })

      const repliesPromise = await Reply.findAll({
        where: { TweetId: tweetId },
        include: [
          { model: User, attributes: { exclude: constants.privateData } }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      })

      const [tweet, replies] = await Promise.all([tweetPromise, repliesPromise])
      tweet.createdAt = utility.toTweetTime(tweet.createdAt)

      return res.render('user', {
        tweet,
        replies,
        partial: 'tweet'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getTweets: async (req, res) => {
    try {
      const offsetCounter = req.params.offset * constants.tweetsPerPage
      const userId = helpers.getUser(req).id
      let tweets = await Tweet.findAll({
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
      tweets = tweets.map(tweet => ({
        ...tweet,
        createdAt: moment(tweet.createdAt).fromNow()
      }))
      return tweets
    } catch (err) {
      console.error(err)
    }
  },

  getUserTweets: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      const tweets = await Tweet.findAll({
        where: { UserId: userId },
        attributes: {
          include: [
            [query.getTweetReplyCount(), 'replyCount'],
            [query.getTweetLikeCount(), 'likeCount'],
            [query.getTweetIsLiked(helpers.getUser(req).id), 'isLiked']
          ]
        },
        order: [['createdAt', 'DESC']],
        raw: true
      })
      return tweets
    } catch (err) {
      console.error(err)
    }
  }
}
