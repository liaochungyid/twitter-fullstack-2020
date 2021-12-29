const helpers = require('../../_helpers')
const db = require('../../models')
const { Op } = require('sequelize')
const { User, Like, Tweet, Notification } = db
// const chatTime = require('../../utils/tweetTime')

module.exports = {
  getNotifications: async (req, res) => {
    try {
      // 登入者上次活動時間 & 訂閱名單
      const userId = req.params.userId
      let Observeds = await User.findAll({ 
        where: { id: userId },
        include: [{
          model: User,
          as: 'Observeds',
          require: false
        }]
      })
      const activeTime = Observeds[0].dataValues.activeTime // 取得該使用者上次活動時間 datetime
      const subscribes = Observeds[0].dataValues.Observeds.map(
        (sub) => sub.Notification.observedId 
      ) // 取得訂閱名單 array


      // 1.未讀的被訂閱事件
      let newSubs = await Notification.findAll({
        where: {
          [Op.and]: [
            {
              observedId: userId,
            },
            {
              createdAt: { [Op.gte]: activeTime } // 篩選訂閱時間在 activeTime 之後的事件
            }
          ]
        },
        include: [
          { model: User, 
            attributes: { exclude: ['password'] },
            as: 'suber'
          },
        ]
      })
      newSubs = newSubs.map(suber => ({
        type: '新的被訂閱事件',
        eventTime: suber.createdAt, // 事件時間
        ...suber.dataValues
      }))


      // 2.未讀的訂閱者新推文
      let newTweets = await Tweet.findAll({
        where: { 
          [Op.and]: [
            {
              UserId: { [Op.in]: subscribes } // 篩選 id 包含在 subscribes 陣列內的
            },
            {
              createdAt: { [Op.gte]: activeTime }
            }
          ]
        },
        include: [{
          model: User,
          attributes: { exclude: ['password'] },
        }]
      })
      newTweets = newTweets.map(newTweet => ({
        type: '新的訂閱推文事件',
        eventTime: newTweet.dataValues.createdAt, // 事件時間
        ...newTweet.dataValues,
      }))


      // 3.未讀的被讚事件
      // 先取得自從上次上線以後被按過讚的推文陣列
      let notiTweets = await Tweet.findAll({
        where: {
          UserId: userId,
        },
        include: { 
          model: Like, 
          where: { // 第二層 where 定義 include進的 model 條件 
            createdAt: { [Op.gte]: activeTime } // 篩選按讚時間在 activeTime 之後的事件
          } 
        }
      })
      notiTweets = notiTweets.map(tweet => (
        tweet.dataValues.id
      ))
      // 再用 推文陣列 查Like
      let newLikes = await Like.findAll({
        where: {
          [Op.and]: [
            {
              TweetId: { [Op.in]: notiTweets }
            }, 
            {
              createdAt: { [Op.gte]: activeTime } // 篩選按讚時間在 activeTime 之後的事件
            } 
          ]
        },
        include: { 
          model: User
        }
      })
      newLikes = newLikes.map(newLike => ({
        type: '新的被讚事件',
        eventTime: newLike.dataValues.createdAt, // 事件時間
        ...newLike.dataValues,
      }))


      // 三個事件結合整理成一個array
      let news = [...newSubs, ...newTweets, ...newLikes]
      news = news.sort((a, b) => b.eventTime - a.eventTime)
      // for (let i of news) {
      //   i.createdAt = chatTime.toTimeOrDatetime(i.createdAt)
      // }

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
