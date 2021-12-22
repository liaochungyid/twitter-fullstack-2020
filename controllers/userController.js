const helpers = require('../_helpers')
const bcrypt = require('bcryptjs')
const utility = require('../utils/utility')

const tweetService = require('../services/tweetService')
const userService = require('../services/userService')

const db = require('../models')
const { sequelize } = db
const { Op } = db.Sequelize
const { User, Tweet, Reply, Like, Followship, Notify } = db

const userController = {
  // PAGES
  indexPage: async (req, res) => {
    try {
      if (helpers.getUser(req).role === 'admin') {
        req.flash('error_messages', '你無法瀏覽此頁面')
        return res.redirect('/admin/tweets')
      }

      const [tweets, pops] = await Promise.all([
        tweetService.getTweets(req, res),
        userService.getPopular(req, res)
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

  tweetsPage: async (req, res) => {
    try {
      const [user, tweets, pops, isNotify] = await Promise.all([
        userService.getUserProfile(req, res),
        userService.getUserTweets(req, res),
        userService.getPopular(req, res),
        userService.getUserIsNotify(req, res)
      ])

      return res.render('user', {
        user,
        tweets,
        pops,
        isNotify,
        partial: 'profileTweets'
      })
    } catch (err) {
      console.error(err)
    }
  },

  repliesPage: async (req, res) => {
    try {
      const [user, replies, pops, isNotify] = await Promise.all([
        userService.getUserProfile(req, res),
        userService.getUserReplies(req, res),
        userService.getPopular(req, res),
        userService.getUserIsNotify(req, res)
      ])
      return res.render('user', {
        user,
        replies,
        pops,
        isNotify,
        partial: 'profileReplies'
      })
    } catch (err) {
      console.error(err)
    }
  },

  likesPage: async (req, res) => {
    try {
      const [user, tweets, pops, isNotify] = await Promise.all([
        userService.getUserProfile(req, res),
        userService.getUserLikes(req, res),
        userService.getPopular(req, res),
        userService.getUserIsNotify(req, res)
      ])
      return res.render('user', {
        user,
        tweets,
        pops,
        isNotify,
        partial: 'profileLikes'
      })
    } catch (err) {
      console.error(err)
    }
  },

  followersPage: async (req, res) => {
    try {
      const [user, followers, pops] = await Promise.all([
        userService.getUserProfile(req, res),
        userService.getUserFollowers(req, res),
        userService.getPopular(req, res)
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

  followingsPage: async (req, res) => {
    try {
      const [user, followings, pops] = await Promise.all([
        userService.getUserProfile(req, res),
        userService.getUserFollowings(req, res),
        userService.getPopular(req, res)
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
  },

  settingsPage: async (req, res) => {
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

  signUpPage: async (req, res) => {
    return res.render('signup')
  },

  signInPage: (req, res) => {
    const isBackend = req.url.includes('admin')
    return res.render('signin', { isBackend })
  },

  // ACTIONS
  signUp: async (req, res) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const errors = []

      const [user1, user2] = await Promise.all([
        User.findOne({ where: { account } }),
        User.findOne({ where: { email } })
      ])

      if (user1) {
        errors.push({ message: 'account 已重覆註冊！' })
      }
      if (user2) {
        errors.push({ message: 'email 已重複註冊！' })
      }
      if (checkPassword !== password) {
        errors.push({ message: '兩次密碼輸入不同！' })
      }
      if (account.length > 30) {
        errors.push({ message: 'account 長度不可大於 30 字元！' })
      }
      if (account.length < 4) {
        errors.push({ message: 'account 長度不可小於 4 字元！' })
      }
      if (password.length < 4) {
        errors.push({ message: 'password 長度不可小於 4 字元！' })
      }
      if (name.length > 50) {
        errors.push({ message: 'name 長度不可超過 50 字元' })
      }

      if (errors.length) {
        return res.render('signup', { errors, account, name, email })
      }

      await User.create({
        account,
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
      })

      req.flash('success_messages', '成功註冊帳號！')
      return res.redirect('/signin')
    } catch (err) {
      console.error(err)
    }
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')

    if (helpers.getUser(req).role === 'admin') {
      return res.redirect('/admin/tweets')
    }
    return res.redirect('/tweets')
  },

  signOut: (req, res) => {
    req.flash('success_messages', '成功登出！')

    if (helpers.getUser(req).role === 'admin') {
      req.logout()
      return res.redirect('/admin/signin')
    }
    req.logout()
    return res.redirect('/signin')
  },

  updateSettings: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      if (helpers.getUser(req).id !== userId) {
        req.flash('error_messages', '你無權查看此頁面')
        return res.redirect('back')
      }

      const user = await User.findByPk(userId)
      const { account, name, email, password, checkPassword } = req.body
      const errors = []

      const [user1, user2] = await Promise.all([
        User.findOne({
          where: {
            account,
            [Op.not]: { account: helpers.getUser(req).account }
          }
        }),
        User.findOne({
          where: { email, [Op.not]: { email: helpers.getUser(req).email } }
        })
      ])

      if (checkPassword !== password) {
        errors.push({ message: '兩次密碼輸入不同！' })
      }
      if (user1) {
        errors.push({ message: 'account 已重覆註冊！' })
      }
      if (user2) {
        errors.push({ message: 'email 已重複註冊！' })
      }
      if (account.length > 30) {
        errors.push({ message: 'account 長度不可大於 30 字元！' })
      }
      if (account.length < 4) {
        errors.push({ message: 'account 長度不可小於 4 字元！' })
      }
      // 使用者沒有更改密碼，即密碼為空，需要用 password 確定是否有輸入
      if (password && password.length < 4) {
        errors.push({ message: 'password 長度不可小於 4 字元！' })
      }
      if (name.length > 50) {
        errors.push({ message: 'name 長度不可超過 50 字元' })
      }

      if (errors.length) {
        return res.render('user', {
          errors,
          account,
          name,
          email,
          partial: 'profileSettings'
        })
      }

      if (password === '') {
        await user.update({
          account,
          name,
          email
        })
      } else {
        await user.update({
          account,
          name,
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        })
      }

      req.flash('success_messages', '成功編輯帳號！')
      return res.redirect('back')
    } catch (err) {
      console.error(err)
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      if (helpers.getUser(req).id !== userId) {
        req.flash('error_messages', '無權更動此頁面資料')
        return res.redirect('back')
      }

      const { name, introduction, coverDefault } = req.body
      const defaultCoverPath =
        'https://cdn.discordapp.com/attachments/918417533680361505/918418130169131028/cover.svg'

      if (!name.length) {
        req.flash('error_messages', '名稱長度不能為零')
        return res.redirect('back')
      }
      if (name.length > 50) {
        req.flash('error_messages', '名稱長度不能超過50字')
        return res.redirect('back')
      }

      const { files } = req
      const avatarPath = files.avatar ? files.avatar[0].path : false
      const coverPath = files.cover ? files.cover[0].path : false
      const user = await User.findByPk(userId)

      if (avatarPath) {
        const avatarLink = await utility.uploadToImgur(avatarPath)
        await user.update({
          avatar: avatarLink
        })
      }

      if (coverPath) {
        const coverLink = await utility.uploadToImgur(coverPath)
        await user.update({
          cover: coverLink
        })
      } else {
        // 若按叉叉後沒有上傳圖片才會進到這，更新預設圖的 svg 連結進資料庫
        if (coverDefault === '') {
          await user.update({
            cover: defaultCoverPath
          })
        }
      }

      await user.update({
        name,
        introduction
      })

      req.flash('success_messages', '成功更新個人資料！')
      return res.redirect('back')
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = userController
