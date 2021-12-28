const helpers = require('../_helpers')

const db = require('../models')
const { User, Reply } = db

const notificationService = require('../services/notificationService')
const replyService = require('../services/replyService')
const userService = require('../services/userService')

module.exports = {
  getReplies: async (req, res) => {
    try {
      const TweetId = Number(req.params.tweetId)
      const replies = await Reply.findAll({
        where: { TweetId },
        attributes: ['id', 'comment', 'createdAt'],
        include: {
          model: User,
          attributes: ['id', 'name', 'avatar', 'account'],
          require: false
        }
      })
      return res.json({ replies })
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

  repliesPage: async (req, res) => {
    try {
      const [user, replies, isNotified] = await Promise.all([
        userService.getUserProfile(req, res),
        replyService.getUserReplies(req, res),
        notificationService.getUserIsNotified(req, res)
      ])
      return res.render('user', {
        user,
        replies,
        isNotified,
        partial: 'profileReplies'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
