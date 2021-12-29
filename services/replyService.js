const helpers = require('../_helpers')
const constants = require('../config/constants')

const db = require('../models')
const { User, Tweet, Reply } = db

module.exports = {
  getReplies: async (req, res) => {
    try {
      const tweetId = Number(req.params.tweetId)
      const replies = await Reply.findAll({
        where: { TweetId: tweetId },
        attributes: ['id', 'comment', 'createdAt'],
        include: [
          { model: User, attributes: { exclude: constants.privateData }, require: false }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      })
      return replies
    } catch (err) {
      console.error(err)
    }
  },

  addReply: async (req, res) => {
    try {
      if (req.body.comment === '') {
        req.flash('errorMessage', '內容不可空白')
        return res.redirect('back')
      }

      await Reply.create({
        UserId: helpers.getUser(req).id,
        TweetId: req.params.tweetId,
        comment: req.body.comment
      })
      return res.redirect('back')
    } catch (err) {
      console.error(err)
    }
  },

  getUserReplies: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      let replies = await Reply.findAll({
        where: { UserId: userId },
        attributes: ['id', 'comment', 'createdAt'],
        include: [
          {
            model: Tweet,
            attributes: ['id'],
            include: [{ model: User, attributes: ['id', 'account'] }]
          }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      })

      replies = replies.map(reply => ({
        id: reply.id,
        comment: reply.comment,
        createdAt: reply.createdAt,
        toAccount: reply.Tweet.User.account,
        toId: reply.Tweet.User.id
      }))

      return replies
    } catch (err) {
      console.error(err)
    }
  }
}
