const db = require('../models')
const { Op } = require('sequelize')
const { User, Message, Tweet, Notify, Like } = db
const chatTime = require('../config/tweetTime')
const moment = require('moment')

const socketService = {
  getPublicNoti: async (userId, callback) => {
    try {
      const activeTime = (await User.findByPk(userId, {
        raw: true,
        attributes: ['activeTime']
      })).activeTime
      console.log(activeTime)
      const hasUnread = await Message.findAll({
        where: {
          'createdAt': { [Op.between]: [moment().subtract(120, 'days').toDate(), moment().toDate()] }
        }
      })
      console.log(hasUnread)

    } catch (err) {
      console.log(err)
    }
  },
  getPrivateNoti: (req, res, callback) => {

  },
  getNotiNoti: (req, res, callback) => {

  }
}

module.exports = socketService