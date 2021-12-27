const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { authenticated, authenticatedAdmin } = require('../middleware/checkAuth')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/adminController')
const chatController = require('../controllers/chatController')
const followshipController = require('../controllers/followshipController')
const likeController = require('../controllers/likeController')
const messageController = require('../controllers/messageController')
const notificationController = require('../controllers/notificationController')
const replyController = require('../controllers/replyController')
const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController')

// 首頁
router.get('/', authenticated, userController.indexPage)
router.get('/tweets', authenticated, userController.indexPage)
// tweet 動作
router.post('/tweets', authenticated, tweetController.addTweet)
router.get('/tweets/:tweetId', authenticated, tweetController.getTweet)
router.get('/tweets/:tweetId/replies', authenticated, replyController.getReplies)
router.post('/tweets/:tweetId/replies', authenticated, replyController.addReply)
// user 頁面
router.get('/users/:userId/tweets', authenticated, userController.tweetsPage)
router.get('/users/:userId/replies', authenticated, userController.repliesPage)
router.get('/users/:userId/likes', authenticated, userController.likesPage)
router.get('/users/:userId/followers', authenticated, userController.followersPage)
router.get('/users/:userId/followings', authenticated, userController.followingsPage)
router.get('/users/:userId/settings', authenticated, userController.settingsPage)
router.get('/chatroom', authenticated, chatController.chatroomPage)
router.get('/messages', authenticated, messageController.messagesPage)
router.get('/notifications', authenticated, notificationController.notificationsPage)
// user 動作
router.put('/users/:userId/settings', authenticated, userController.updateSettings)
router.put('/users/:userId/update', authenticated, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), userController.updateProfile)
router.post('/followships', authenticated, followshipController.addFollow)
router.delete('/followships/:userId', authenticated, followshipController.removeFollow)
// admin 相關
router.get('/admin', authenticatedAdmin, adminController.tweetsPage)
router.get('/admin/tweets', authenticatedAdmin, adminController.tweetsPage)
router.get('/admin/users', authenticatedAdmin, adminController.usersPage)
router.delete('/admin/tweets/:tweetId', authenticatedAdmin, adminController.deleteTweet)
// authentication 頁面
router.get('/signup', userController.signUpPage)
router.get('/signin', userController.signInPage)
router.get('/admin/signin', userController.signInPage)
// authentication 動作
router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/signout', userController.signOut)
router.post('/admin/signin', passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }), userController.signIn)
router.get('/admin/signout', userController.signOut)
// 測試檔
router.post('/tweets/:tweetId/like', authenticated, likeController.addLike)
router.post('/tweets/:tweetId/unlike', authenticated, likeController.removeLike)

module.exports = router
