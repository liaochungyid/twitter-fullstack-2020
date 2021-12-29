const helpers = require('../../_helpers')
const db = require('../../models')
const { User, Like, Tweet, Notification } = db
const chatTime = require('../../utils/tweetTime')

module.exports = {
  getNotifications: async (req, res) => {
    try {
      const userId = req.params.userId

      let activeTime = await User.findAll({ where: { id: userId } })
      activeTime = activeTime[0].activeTime // 取得登入者上次活動時間 datetime

      let notifies = await Notification.findAll({
        where: { observerId: userId }
      })
      notifies = notifies.map(notify => ({
        ...notify.dataValues
      }))
      subscribes = notifies.map(sub => sub.observedId) // 取得訂閱名單 array

      // 修改關聯性後再加入 未讀的被追蹤事件
      // let subscribers = await Notification.findAll({
      //   where: {observedId: userId},
      // })
      // subscribers = subscribers.map(suber => ({
      //   ...suber.dataValues,
      //   type: '未讀的被追蹤事件'
      // }))
      // subscribers = subscribers.filter(suber => (suber.createdAt - activeTime) > 0)

      let newTweets = await Tweet.findAll({ include: [{ model: User }] })
      newTweets = newTweets.map(newTweet => ({
        ...newTweet.dataValues,
        type: '未讀的追蹤者推文'
      }))
      newTweets = newTweets.filter(
        newTweet => newTweet.createdAt - activeTime > 0
      )
      newTweets = newTweets.filter(newTweet =>
        subscribes.includes(newTweet.UserId)
      )

      let newLikes = await Like.findAll({
        where: { UserId: userId },
        include: [{ model: User }]
      })
      newLikes = newLikes.map(newLike => ({
        ...newLike.dataValues,
        type: '未讀的被讚事件'
      }))
      newLikes = newLikes.filter(newLike => newLike.createdAt - activeTime > 0)

      // 三個事件結合整理成一個array
      let news = [...newTweets, ...newLikes] // 預計設訂閱關聯性以後加入 ...subscribers,
      news = news.sort((a, b) => a.createdAt - b.createdAt)
      news.forEach(n => {
        n.createdAt = chatTime.toTimeOrDatetime(n.createdAt)
      })

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
