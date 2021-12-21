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
  }
}

module.exports = socketService