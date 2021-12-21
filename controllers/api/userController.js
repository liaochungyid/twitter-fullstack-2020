const helpers = require('../../_helpers')
const bcrypt = require('bcryptjs')

const db = require('../../models')
const { User, sequelize } = db

const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  getEditModal: async (req, res) => {
    try {
      if (helpers.getUser(req).id !== Number(req.params.userId)) {
        return res.json({ status: 'error', message: '你無權查看此頁面' })
      }
      const loginUser = await User.findByPk(req.params.userId)
      return res.json(loginUser)
    } catch (err) {
      console.error(err)
    }
  },

  updateUser: async (req, res) => {
    try {
      if (helpers.getUser(req).id !== Number(req.params.userId)) {
        return res.json({ status: 'error', message: '你無權查看此頁面' })
      }
      const user = await User.findByPk(req.params.userId)
      const { name, avatar, introduction, cover } = req.body
      await user.update({
        name,
        avatar,
        introduction,
        cover
      })
      return res.json({ status: 'success', message: '使用者資料編輯成功' })
    } catch (err) {
      console.error(err)
    }
  },

  getUsers: async (req, res) => {
    try {
      let users = await User.findAll({
        attributes: [
          'id',
          'email',
          'name',
          'avatar',
          'account',
          'cover',
          'role',
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
            ),
            'followerCount'
          ]
        ]
      })
      console.log(users)
      users = users
        .filter((user) => user.dataValues.role !== 'admin')

      users = users
        .sort((a, b) => b.followerCount - a.followerCount)

      return res.json(users) // 返回前除admin外 users array
    } catch (err) {
      console.error(err)
    }
  },

  signIn: async (req, res) => {
    const { account, password } = req.body

    if (!account || !password) {
      return res.json({ status: 'error', message: '所有欄位必須填寫！' })
    }

    const user = await User.findOne({ where: { account } })

    if (!user) {
      return res.status(401).json({ status: 'error', message: '帳號不存在！' })
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: 'error', message: '密碼錯誤！' })
    }

    const payload = { id: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    return res.json({ status: 'success', message: '成功登入！', token: token, user: user })
  }
}

module.exports = userController
