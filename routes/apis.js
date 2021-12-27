const express = require('express')
const router = express.Router()

const likeController = require('../controllers/api/likeController')
const notificationController = require('../controllers/api/notificationController')
const tweetController = require('../controllers/api/tweetController')
const userController = require('../controllers/api/userController')

// tweet 動作
router.post('/tweets/:tweetId/likes', likeController.addLike)
router.delete('/tweets/:tweetId/likes', likeController.removeLike)

// user 動作
router.get('/chatusers/:userId', userController.getUsers) // find chat api
router.get('/tweets/:tweetId', tweetController.getTweet) // reply modal api
router.get('/page/:offset', tweetController.getTweets) // 按鈕點擊"更多推文" API
router.get('/pops/:offset', userController.getPops) // 按鈕點擊"更多熱門使用者" API

// notify 動作
router.post('/notify/:userId', notificationController.addNotification)
router.delete('/notify/:userId', notificationController.removeNotification)
router.get('/news/:userId', notificationController.getNew) // 訂閱物件通知的 api

module.exports = router
