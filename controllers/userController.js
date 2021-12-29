const helpers = require('../_helpers')
const constants = require('../config/constants')
const bcrypt = require('bcryptjs')
const utility = require('../utils/utility')

const db = require('../models')
const { Op } = db.Sequelize
const { User } = db

module.exports = {
  settingsPage: (req, res) => {
    return res.render('user', { partial: 'profileSettings' })
  },

  signUpPage: async (req, res) => {
    return res.render('signup')
  },

  signInPage: (req, res) => {
    const isBackend = req.url.includes('admin')
    return res.render('signin', { isBackend })
  },

  signUp: async (req, res) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const errors = []

      const [checkAccount, checkEmail] = await Promise.all([
        User.findOne({ where: { account } }),
        User.findOne({ where: { email } })
      ])

      if (checkPassword !== password) {
        errors.push({ message: '兩次密碼輸入不同！' })
      }
      if (checkAccount) {
        errors.push({ message: 'account 已重覆註冊！' })
      }
      if (checkEmail) {
        errors.push({ message: 'email 已重複註冊！' })
      }
      if (account.length > constants.maxAccountLength) {
        errors.push({
          message: `account 長度不可大於 ${constants.maxAccountLength} 字元！`
        })
      }
      if (account.length < constants.minAccountLength) {
        errors.push({
          message: `account 長度不可小於 ${constants.minAccountLength} 字元！`
        })
      }
      if (password.length < constants.minPasswordLength) {
        errors.push({
          message: `password 長度不可小於 ${constants.minPasswordLength} 字元！`
        })
      }
      if (name.length > constants.maxNameLength) {
        errors.push({
          message: `name 長度不可超過 ${constants.maxNameLength} 字元`
        })
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

      req.flash('successMessage', '成功註冊帳號！')
      return res.redirect('/signin')
    } catch (err) {
      console.error(err)
    }
  },

  signIn: (req, res) => {
    req.flash('successMessage', '成功登入！')

    if (helpers.getUser(req).role === 'admin') {
      return res.redirect('/admin/tweets')
    }
    return res.redirect('/tweets')
  },

  signOut: (req, res) => {
    req.flash('successMessage', '成功登出！')
    req.logout()

    if (req.url.includes('admin')) {
      return res.redirect('/admin/signin')
    }
    return res.redirect('/signin')
  },

  updateSettings: async (req, res) => {
    try {
      const userId = Number(helpers.getUser(req).id)
      const user = await User.findByPk(userId)
      const { account, name, email, password, checkPassword } = req.body
      const errors = []

      const [checkAccount, checkEmail] = await Promise.all([
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
      if (checkAccount) {
        errors.push({ message: 'account 已重覆註冊！' })
      }
      if (checkEmail) {
        errors.push({ message: 'email 已重複註冊！' })
      }
      if (account.length > constants.maxAccountLength) {
        errors.push({
          message: `account 長度不可大於 ${constants.maxAccountLength} 字元！`
        })
      }
      if (account.length < constants.minAccountLength) {
        errors.push({
          message: `account 長度不可小於 ${constants.minAccountLength} 字元！`
        })
      }
      // 使用者沒有更改密碼，即密碼為空，需要用 password 確定是否有輸入
      if (password && password.length < constants.minPasswordLength) {
        errors.push({
          message: `password 長度不可小於 ${constants.minPasswordLength} 字元！`
        })
      }
      if (name.length > constants.maxNameLength) {
        errors.push({
          message: `name 長度不可超過 ${constants.maxNameLength} 字元`
        })
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

      req.flash('successMessage', '成功編輯帳號！')
      return res.redirect('back')
    } catch (err) {
      console.error(err)
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      if (helpers.getUser(req).id !== userId) {
        req.flash('errorMessage', '無權更動此頁面資料')
        return res.redirect('back')
      }

      const { name, introduction, coverDefault } = req.body
      const defaultCoverPath =
        'https://cdn.discordapp.com/attachments/918417533680361505/918418130169131028/cover.svg'

      if (!name.length) {
        req.flash('errorMessage', '請輸入名稱')
        return res.redirect('back')
      }
      if (name.length > constants.maxNameLength) {
        req.flash(
          'errorMessage',
          `名稱長度不能超過 ${constants.maxNameLength} 字`
        )
        return res.redirect('back')
      }
      if (introduction.length > constants.maxIntroductionLength) {
        req.flash(
          'errorMessage',
          `自我介紹長度不能超過 ${constants.maxIntroductionLength} 字`
        )
        return res.redirect('back')
      }

      const { files } = req
      const avatar = files.avatar ? files.avatar[0] : false
      const cover = files.cover ? files.cover[0] : false
      const user = await User.findByPk(userId)

      if (avatar) {
        const avatarLink = await utility.uploadToImgur(avatar)
        await user.update({
          avatar: avatarLink
        })
      }

      if (cover) {
        const coverLink = await utility.uploadToImgur(cover)
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

      req.flash('successMessage', '成功更新個人資料！')
      return res.redirect('back')
    } catch (err) {
      console.error(err)
    }
  }
}
