const db = require('../models')
const { Op } = require('sequelize')
const { User, Chat, Message, Notification } = db
const chatTime = require('../utils/tweetTime')
const moment = require('moment')

const socketService = {
  getPrivateNoti: async userId => {
    try {
      const privateMessage = await Message.count({
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
  getNotiNoti: async userId => {
    try {
      const activeTime = (
        await User.findByPk(userId, {
          raw: true,
          attributes: ['activeTime']
        })
      ).activeTime

      const notifies = await Notification.count({
        where: {
          observerId: userId,
          createdAt: { [Op.gt]: activeTime }
        }
      })

      return notifies
    } catch (err) {
      console.log(err)
    }
  },
  getUserInfo: async userId => {
    try {
      return await User.findByPk(userId, {
        raw: true,
        attributes: ['id', 'name', 'avatar', 'account']
      })
    } catch (err) {
      console.log(err)
    }
  },
  getPreviousMsg: async (userIdList = false, limit = 25, offset = 0) => {
    try {
      let msg
      if (userIdList) {
        msg = await Message.findAll({
          raw: true,
          attributes: ['id', 'senderId', 'text', 'unread', 'createdAt'],
          where: {
            [Op.or]: [
              {
                [Op.and]: [{
                  senderId: userIdList[0],
                  receiverId: userIdList[1]
                }]
              },
              {
                [Op.and]: [{
                  receiverId: userIdList[0],
                  senderId: userIdList[1]
                }]
              }
            ]
          },
          order: [['createdAt', 'DESC']],
          limit,
          offset
        })
      } else {
        msg = await Chat.findAll({
          raw: true,
          nest: true,
          attributes: ['text', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit,
          offset,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'account', 'avatar'],
              require: false
            }
          ]
        })
      }

      msg = await msg.map(m => {
        return Object.assign(m, {
          createdAt: chatTime.toTimeOrDatetime(m.createdAt)
        })
      })

      return msg.reverse()
    } catch (err) {
      console.log(err)
    }
  },
  getPreviousUser: async userIdList => {
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
  createChat: async data => {
    try {
      const msg = (await Chat.create(data)).dataValues
      msg.createdAt = chatTime.toTimeOrDatetime(msg.createdAt)

      return msg
    } catch (err) {
      console.log(err)
    }
  },
  getPreviousPrivateUsers: async userId => {
    try {
      const previousPrivateMsg = await Message.findAll({
        raw: true,
        attributes: ['senderId', 'receiverId'],
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        order: [['createdAt', 'DESC']]
      })

      if (!previousPrivateMsg.length) return []

      const noRepeatOpUser = [...new Set(
        Array.from(previousPrivateMsg)
          .map(value => value.senderId === userId ? value.receiverId : value.senderId)
      )]

      const previousPrivateUsers = await User.findAll({
        raw: true,
        attributes: ['id', 'name', 'account', 'avatar'],
        where: {
          id: { [Op.or]: noRepeatOpUser }
        }
      })

      let previousPrivateUsersMsg = await Promise.all(
        noRepeatOpUser.map(async value => {
          return await Message.findAll({
            raw: true,
            where: {
              [Op.or]: [
                { [Op.and]: [{ senderId: value, receiverId: userId }] },
                { [Op.and]: [{ receiverId: value, senderId: userId }] }
              ]
            },
            attributes: ['text', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 1
          })
        }))

      previousPrivateUsersMsg = await previousPrivateUsersMsg.map(value => {
        return Object.assign(value[0], {
          createdAt: chatTime.toTimeOrDatetime(value[0].createdAt)
        })
      })

      return await previousPrivateUsers.map((v, i) => {
        return Object.assign(v,
          previousPrivateUsersMsg[i]
        )
      })
    } catch (err) {
      console.log(err)
    }
  },
  createMessage: async data => {
    try {
      let msg = (await Message.create(data)).dataValues
      msg = await Message.findOne({ where: msg, raw: true })
      msg.createdAt = chatTime.toTimeOrDatetime(msg.createdAt)

      return msg
    } catch (err) {
      console.log(err)
    }
  },
  updateReadMsg: async msgIds => {
    try {
      Promise.all(msgIds.map(id => {
        return Message.findByPk(id).then(msg => msg.update({ unread: false }))
      }))
    } catch (err) {
      console.log(err)
    }
  },
  updateActiveTime: userId => {
    try {
      console.log('-------------------------')
      console.log(new Date())
      return User.findByPk(userId).then(u => {
        u.update({ activeTime: new Date() })
      })
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = socketService
