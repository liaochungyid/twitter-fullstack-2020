const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { authenticated, authenticatedAdmin } = require('../middleware/checkAuth')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/adminController')
const followshipController = require('../controllers/followshipController')
const replyController = require('../controllers/replyController')
const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController')
const pageController = require('../controllers/pageController')

// 首頁
router.get('/', authenticated, userController.indexPage) // ok!!
router.get('/tweets', authenticated, userController.indexPage) // ok!!
// tweet 動作
router.post('/tweets', authenticated, tweetController.addTweet)
router.get('/tweets/:tweetId', authenticated, tweetController.getTweet)
router.post('/tweets/:tweetId/like', authenticated, tweetController.addLike)
router.post('/tweets/:tweetId/unlike', authenticated, tweetController.removeLike)
router.get('/tweets/:tweetId/replies', authenticated, replyController.getReplies)
router.post('/tweets/:tweetId/replies', authenticated, replyController.addReply)
// user 頁面
router.get('/users/:userId/tweets', authenticated, userController.tweetsPage) // ok!!
router.get('/users/:userId/replies', authenticated, userController.repliesPage) // ok!!
router.get('/users/:userId/likes', authenticated, userController.likesPage) // ok!!
router.get('/users/:userId/followers', authenticated, userController.followersPage) // ok!!
router.get('/users/:userId/followings', authenticated, userController.followingsPage) // ok!!
router.get('/users/:userId/settings', authenticated, userController.settingsPage) // ok!!
router.get('/users/:userId/profileNotis', authenticated, pageController.getNotis)
router.get('/users/:userId/profileChatPub', authenticated, pageController.getChatPublic)
router.get('/users/:userId/profileChatPris', authenticated, pageController.getChatPrivates)
// 重新命名路由
router.get('/users/:userId/notifications')
router.get('/users/:userId/chatroom')
router.get('/users/:userId/messages')
// user 動作
router.put('/users/:userId/settings', authenticated, userController.updateSettings)
router.put('/users/:userId/update', authenticated, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), userController.updateProfile)
router.post('/followships', authenticated, followshipController.addFollow)
router.delete('/followships/:userId', authenticated, followshipController.removeFollow)
// admin 相關
router.get('/admin', authenticatedAdmin, adminController.tweetsPage) // ok!!
router.get('/admin/tweets', authenticatedAdmin, adminController.tweetsPage) // ok!!
router.get('/admin/users', authenticatedAdmin, adminController.usersPage) // ok!!
router.delete('/admin/tweets/:tweetId', authenticatedAdmin, adminController.deleteTweet) // ok!!
// authentication 頁面
router.get('/signup', userController.signUpPage) // ok!!
router.get('/signin', userController.signInPage) // ok!!
router.get('/admin/signin', userController.signInPage) // ok!!
// authentication 動作
router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/signout', userController.signOut)
router.post('/admin/signin', passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }), userController.signIn)
router.get('/admin/signout', userController.signOut)

module.exports = router
