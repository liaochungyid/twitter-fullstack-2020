const express = require('express')
const router = express.Router()

const followshipController = require('../controllers/api/followshipController')
const likeController = require('../controllers/api/likeController')
const notificationController = require('../controllers/api/notificationController')
const tweetController = require('../controllers/api/tweetController')
const userController = require('../controllers/api/userController')

router.post('/tweets/:tweetId/likes', likeController.addLike)
router.delete('/tweets/:tweetId/likes', likeController.removeLike)
router.post('/followships/:userId', followshipController.addFollow)
router.delete('/followships/:userId', followshipController.removeFollow)
router.get('/chatusers/:userId', userController.getUsers) // find chat api
router.get('/tweets/:tweetId', tweetController.getTweet) // reply modal api
router.get('/tweets/pages/:offset', tweetController.getTweets) // 按鈕點擊"更多推文" API
router.get('/pops/:offset', userController.getPopular) // 按鈕點擊"更多熱門使用者" API

router.get('/users/:userId/notifications', notificationController.transNotifications)
router.post('/users/:userId/notifications', notificationController.addNotification)
router.delete('/users/:userId/notifications', notificationController.removeNotification)

router.get('/users/:userId', userController.getEditModal)
router.post('/users/:userId', userController.updateUser)

module.exports = router
