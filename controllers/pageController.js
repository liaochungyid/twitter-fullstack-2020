const helpers = require('../_helpers')
const userController = require('./userController')
const tweetController = require('./tweetController')
// 測試用
const db = require('../models')
const { sequelize } = db
const { Op } = db.Sequelize
const { User, Tweet, Reply, Like, Followship, Message, PrivateMessage } = db

const pageController = {
  getTest: async (req, res) => {
    const loginUserId = 11
    const privateMessages = await PrivateMessage.findAll({
      attributes: [
        'id',
        'senderId',
        'receiverId',
        'text',
        'unread',
        'createdAt',
        'updatedAt'
      ],
      where: {
        [Op.or]: [{ senderId: loginUserId }, { receiverId: loginUserId }]
      },
      order: [['createdAt', 'DESC']],
      raw: true
    })

    console.log('privateMessages.length', privateMessages.length)
    const records = []
    const showedPrivateMessages = []

    for (let i = 0; i < privateMessages.length; i++) {
      const senderId = Number(privateMessages[i].senderId)
      const receiverId = Number(privateMessages[i].receiverId)
      if (senderId === loginUserId) {
        if (!records.includes(receiverId)) {
          records.push(receiverId)
          const showedUser = await User.findByPk(receiverId).then((result) =>
            result.toJSON()
          )

          const appended = {
            pmId: privateMessages[i].id,
            isIt: false,
            unread: privateMessages[i].unread,
            createdAt: privateMessages[i].createdAt
          }

          showedPrivateMessages.push({
            ...showedUser,
            ...appended
          })
        }
      } else {
        if (!records.includes(senderId)) {
          records.push(senderId)
          const showedUser = await User.findByPk(senderId).then((result) =>
            result.toJSON()
          )

          const appended = {
            pmId: privateMessages[i].pmId,
            isIt: true,
            unread: privateMessages[i].unread,
            createdAt: privateMessages[i].createdAt
          }

          showedPrivateMessages.push({
            ...showedUser,
            ...appended
          })
        }
      }
    }
    console.log(records)
    return res.json({ showedPrivateMessages })

    // const records = []

    // for (let i = 0; i < privateMessages.length; i ++) {
    //   console.log('id', id)
    //   console.log('senderId', senderId)
    //   const user = await User.findByPk(senderId).then(result => result.toJSON())
    //   console.log(`user ${i}`, user)
    // }

    // const a = privateMessages.map(privateMessage => {
    //   id: privateMessage.id
    // })
    // console.log(a)

    return res.json({ privateMessages })

    // const privateMessagesByMe = await PrivateMessage.findAll({
    //   where: { senderId: 31 },
    //   raw: true,
    //   group: 'senderId'
    // })
    // const privateMessagesFromMe = await PrivateMessage.findAll({
    //   where: { receiverId: 31 },
    //   raw: true,
    //   group: 'receiverId'
    // })
    // console.log('privateMessagesByMe', privateMessagesByMe)
    // console.log('='.repeat(50))
    // console.log('privateMessagesFromMe', privateMessagesFromMe)
    // return res.send('<h1>RUN IT!</h1>')

    // const privateMessages = await PrivateMessage.findAll({
    //   where: {
    //     [Op.or]: [{ senderId: 31 }, { receiverId: 31 }]
    //   },
    //   group: User,
    //   order: [['createdAt', 'DESC']],
    //   raw: true
    // })
    // console.log(privateMessages)
  },

  getNotis: async (req, res) => {
    try {
      const [pops] = await Promise.all([userController.getPopular(req, res)])
      return res.render('user', {
        pops,
        partial: 'profileNotis'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getChatPublic: (req, res) => {
    return res.render('user', { partial: 'profileChatPub' })
  },

  getChatPrivates: (req, res) => {
    return res.render('user', { partial: 'profileChatPris' })
  },

  getSignUp: async (req, res) => {
    return res.render('signup')
  },

  getSignIn: (req, res) => {
    const isBackend = req.url.includes('admin')
    return res.render('signin', { isBackend })
  },

  getIndex: async (req, res) => {
    try {
      if (helpers.getUser(req).role === 'admin') {
        req.flash('error_messages', '你無法瀏覽此頁面')
        return res.redirect('/admin/tweets')
      }

      const [tweets, pops] = await Promise.all([
        tweetController.getTweets(req, res),
        userController.getPopular(req, res)
      ])

      return res.render('user', {
        tweets,
        pops,
        partial: 'tweets'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getSettings: async (req, res) => {
    try {
      if (helpers.getUser(req).id !== Number(req.params.userId)) {
        req.flash('error_messages', '你無法瀏覽此頁面')
        return res.redirect('/tweets')
      }

      return res.render('user', {
        partial: 'profileSettings'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getUserTweets: async (req, res) => {
    try {
      const [user, tweets, pops] = await Promise.all([
        userController.getUserProfile(req, res),
        userController.getUserTweets(req, res),
        userController.getPopular(req, res)
      ])
      return res.render('user', {
        user,
        tweets,
        pops,
        partial: 'profileTweets'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getUserReplies: async (req, res) => {
    try {
      const [user, replies, pops] = await Promise.all([
        userController.getUserProfile(req, res),
        userController.getUserReplies(req, res),
        userController.getPopular(req, res)
      ])
      return res.render('user', {
        user,
        replies,
        pops,
        partial: 'profileReplies'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getUserLikes: async (req, res) => {
    try {
      const [user, tweets, pops] = await Promise.all([
        userController.getUserProfile(req, res),
        userController.getUserLikes(req, res),
        userController.getPopular(req, res)
      ])
      return res.render('user', {
        user,
        tweets,
        pops,
        partial: 'profileLikes'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getUserFollowers: async (req, res) => {
    try {
      const [user, followers, pops] = await Promise.all([
        userController.getUserProfile(req, res),
        userController.getUserFollowers(req, res),
        userController.getPopular(req, res)
      ])
      return res.render('user', {
        user,
        followers,
        pops,
        partial: 'profileFollower'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getUserFollowings: async (req, res) => {
    try {
      const [user, followings, pops] = await Promise.all([
        userController.getUserProfile(req, res),
        userController.getUserFollowings(req, res),
        userController.getPopular(req, res)
      ])
      return res.render('user', {
        user,
        followings,
        pops,
        partial: 'profileFollowing'
      })
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = pageController
