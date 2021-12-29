const helpers = require('../_helpers')

const notificationService = require('../services/notificationService')
const replyService = require('../services/replyService')
const tweetService = require('../services/tweetService')
const userService = require('../services/userService')

module.exports = {
  addTweet: (req, res) => {
    tweetService.addTweet(req, res, data => {
      if (data.status === 'success') {
        return res.redirect('/tweets')
      }
      if (data.status === 'error') {
        return res.redirect('back')
      }
    })
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
  },

  tweetPage: async (req, res) => {
    try {
      const [tweet, replies] = await Promise.all([
        tweetService.getTweet(req, res),
        replyService.getReplies(req, res)
      ])

      return res.render('user', {
        tweet,
        replies,
        partial: 'tweet'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
