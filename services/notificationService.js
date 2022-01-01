const helpers = require('../_helpers')

const db = require('../models')
const { User, Like, Tweet, Notification } = db
const { Op } = require('sequelize')

const { notiMinSize } = require('../config/constants')

module.exports = {
  getUserIsNotified: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      const isNotified = await Notification.count({
        where: {
          observerId: userId,
          observedId: req.params.userId
        }
      })

      return isNotified
    } catch (err) {
      console.error(err)
    }
  },
  
  getNotifications: async (req, res, next, pramArr = [ undefined, 0, 0, 0 ], activeTime = undefined) => {
    try {
      // 參數處理
      const userId = req.params.userId
      let [ newslimit, ofs1, ofs2, ofs3 ] = pramArr 
      if (newslimit === 0) newslimit = undefined // sequelize offset 需用 undefined
      if (newslimit < 0) { // newslimit 表示訊息已夠不需再查找的情況 就直接return了
        const news = []
        const nextPramArr = []
        return [ news, nextPramArr ]
      } 

        
      // 登入者上次活動時間 & 訂閱名單
      let Observeds = await User.findAll({ 
        where: { id: userId },
        include: [{
          model: User,
          as: 'Observeds',
          require: false
        }]
      })
      if (activeTime === undefined) { 
        activeTime = Observeds[0].dataValues.activeTime 
      } // 取得該使用者上次活動時間 datetime
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
        ],
        limit: newslimit,
        offset: ofs1,
        order: [['createdAt', 'DESC']]
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
        }],
        limit: newslimit,
        offset: ofs2,
        order: [['createdAt', 'DESC']]
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
        },
        limit: newslimit,
        offset: ofs3,
        order: [['createdAt', 'DESC']]
      })
      newLikes = newLikes.map(newLike => ({
        type: '新的被讚事件',
        eventTime: newLike.dataValues.createdAt, // 事件時間
        ...newLike.dataValues,
      }))
      

      // 三個事件結合整理成一個array
      let news = [...newSubs, ...newTweets, ...newLikes]
      news = news.sort((a, b) => b.eventTime - a.eventTime)
      
      // 根據是否需要長度切片給出結果
      if (newslimit) news = news.slice(0, newslimit)

      // 紀錄 limit, offset 參數陣列給第二次撈訊息時用
      const nextPramArr = [ notiMinSize - news.length, newSubs.length, newTweets.length, newLikes.length ] 

      return [ news, nextPramArr ]
    } catch (err) {
      console.error(err)
    }
  }
}
