const helpers = require('../_helpers')
const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController')
const followshipController = require('../controllers/api/followshipController')
const notifyController = require('../controllers/api/notifyController')
// const replyController = require('../controllers/api/replyController')
const tweetServer = require('../controllers/api/tweetServer')
const userController = require('../controllers/api/userController')
const newsServer = require('../controllers/api/newsServer')

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  return res.json({ status: 'error', message: '你無權查看此頁面' })
}

// tweet 動作
// router.post('/tweets', tweetController.addTweet)
// router.get('/tweets/:tweetId', tweetController.getTweet)
// router.post('/tweets/:tweetId/like', tweetController.addLike)
// router.post('/tweets/:tweetId/unlike', tweetController.removeLike)
// router.get('/tweets/:tweetId/replies', replyController.getReplies)
// router.post('/tweets/:tweetId/replies', replyController.addReply)

// user 動作
router.get('/users/:userId', authenticated, userController.getEditModal)
router.post('/users/:userId', authenticated, userController.updateUser)
router.get('/chatusers/:userId', authenticated, userController.getUsers) // find chat api
router.get('/tweets/:tweetId', authenticated, tweetServer.getTweet) // reply modal api
router.post('/followships', followshipController.addFollow)
router.delete('/followships/:userId', followshipController.removeFollow)

// admin 動作
router.get('/admin', (req, res) => res.redirect('/admin/tweets'))
router.get('/admin/tweets', adminController.getTweets)
router.delete('/admin/tweets/:tweetId', adminController.deleteTweet)
// router.get('/admin/users', adminController.adminUsers)

// authentication 相關
// router.post('/signup', userController.signUp)
// router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
// router.get('/signout', userController.signOut)
// router.post('/admin/signin', passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }), userController.signIn)
// router.get('/admin/signout', userController.signOut)

router.get('/news', authenticated, newsServer.getNew) // 訂閱物件通知的 api

router.post('/followships', followshipController.addFollow)
router.delete('/followships/:userId', followshipController.removeFollow)

router.get('/admin/tweets', adminController.getTweets)
router.delete('/admin/tweets/:tweetId', adminController.deleteTweet)

// notify 動作
router.post('/notify/:userId', authenticated, notifyController.createNotify)
router.delete('/notify/:userId', authenticated, notifyController.deleteNotify)

module.exports = router
