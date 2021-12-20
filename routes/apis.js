const helpers = require('../_helpers')
const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController')
const followshipController = require('../controllers/api/followshipController')
const userController = require('../controllers/api/userController')
const tweetServer = require('../controllers/api/tweetServer')

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  return res.json({ status: 'error', message: '你無權查看此頁面' })
}

router.get('/users/:userId', authenticated, userController.getEditModal)
router.post('/users/:userId', authenticated, userController.updateUser)
router.get('/chatusers/:userId', authenticated, userController.getUsers) // find chat api
router.get('/tweets/:tweetId', authenticated, tweetServer.getTweet) // reply modal api

router.post('/followships', followshipController.addFollow)
router.delete('/followships/:userId', followshipController.removeFollow)

router.get('/admin/tweets', adminController.getTweets)
router.delete('/admin/tweets/:tweetId', adminController.deleteTweet)

module.exports = router
