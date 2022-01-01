const notificationService = require('../../services/notificationService')
const helpers = require('../../_helpers')
const db = require('../../models')
const { Notification } = db

const { allTime } = require('../../config/constants')

module.exports = {
  transNotifications: async (req, res) => {
    try { 
      const not = () => {}
      // 撈上次登入以來累積的新訊息
      let [ realNews, nextArr ] = await notificationService.getNotifications(req, res)

      // 若新訊息不夠需要多找 傳參數 getNotifications 會補不足 notiMinSize 的量
      let [ supportNews, finalArr ] = await notificationService.getNotifications(req, res, not, nextArr, allTime)
      
      // 把 真實新訊息 跟 補充訊息 結合為最後結果
      const news = [ ...realNews, ...supportNews ]

      return res.json(news)
    } catch (err) {
      console.error(err)
    }
  },

  addNotification: async (req, res) => {
    try {
      const loginUser = helpers.getUser(req).id

      await Notification.create({
        observerId: loginUser,
        observedId: req.params.userId
      })

      return res.json({ status: 'success', message: '已加入關注' })
    } catch (err) {
      console.error(err)
      return res.json({ status: 'error', message: '加入關注失敗' })
    }
  },

  removeNotification: async (req, res) => {
    try {
      const loginUser = helpers.getUser(req).id

      await Notification.destroy({
        where: {
          observerId: loginUser,
          observedId: req.params.userId
        }
      })

      return res.json({ status: 'success', message: '已移除關注' })
    } catch (err) {
      console.error(err)
      return res.json({ status: 'error', message: '取消關注失敗' })
    }
  }
}
