const db = require('../models')
const { Op } = require('sequelize')
const { User, Message, PrivateMessage, Notify, Tweet, Like } = db
const chatTime = require('../config/tweetTime')
const moment = require('moment')

const socketService = {
  getPublicNoti: async (userId) => {
    try {
      const activeTime = (await User.findByPk(userId, {
        raw: true,
        attributes: ['activeTime']
      })).activeTime

      const hasUnread = await Message.count({
        where: {
          'createdAt': { [Op.gt]: activeTime }
        }
      })

      return hasUnread === 0

    } catch (err) {
      console.log(err)
    }
  },
  getPrivateNoti: async (userId) => {
    try {
      const privateMessage = await PrivateMessage.count({
        where: {
          receiverId: userId,
          unread: true
        }
      })

      return privateMessage

    } catch (err) {
      console.log(err)
    }

  },
  getNotiNoti: async (userId) => {
    try {
      const activeTime = (await User.findByPk(userId, {
        raw: true,
        attributes: ['activeTime']
      })).activeTime

      const notifies = await Notify.count({
        where: {
          observerId: userId,
          'createdAt': { [Op.gt]: activeTime }
        },
      })

      return notifies

    } catch (err) {
      console.log(err)
    }
  },
  getUserInfo: async (userId) => {
    try {
      return await User.findByPk(userId, {
        raw: true,
        attributes: ['id', 'name', 'avatar', 'account']
      })
    } catch (err) {
      console.log(err)
    }
  },
  getPreviousMsg: async (userId = false, limit = 25, offset = 0) => {
    try {
      if (userId) {
        console.log('not implement yet!')
      } else {
        const msg = await Message.findAll({
          raw: true,
          nest: true,
          attributes: ['text', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit,
          offset,
          include: [{
            model: User,
            attributes: ['id', 'name', 'account', 'avatar'],
            require: false
          }]
        })

        return msg.reverse()
      }
    } catch (err) {
      console.log(err)
    }
  },
  getPreviousUser: async (userIdList) => {
    try {
      const userList = await Promise.all(
        userIdList.map(uid => {
          return User.findByPk(uid, {
            raw: true,
            attributes: ['name', 'avatar', 'account']
          })
        })
      )

      return userList
    } catch (err) {
      console.log(err)
    }
  },
  createMessage: async (data) => {
    try {
      const message = await Message.create(data)

      return message.dataValues
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = socketService