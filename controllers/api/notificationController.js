const helpers = require('../../_helpers')
const db = require('../../models')
const { Op } = require('sequelize')
const { User, Like, Tweet, Notification } = db
const chatTime = require('../../utils/tweetTime')

module.exports = {
  getNew: async (req, res) => {
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
      let newSubs = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [
          { model: User,
            attributes: { exclude: ['password'] },
            as: 'Observeds',
            where: { // 第二層 where 定義 include進的 model 條件 
              createdAt: { [Op.gte]: activeTime } // 篩選按讚時間在 activeTime 之後的事件
            } 
          },
        ]
      })
      newSubs = newSubs.map(suber => ({
        ...suber.dataValues,
        eventTime: suber.dataValues.Observeds[0].Notification.createdAt, // 事件時間
        type: '新的被訂閱事件'
      }))


      // 2.未讀的訂閱者新推文
      let newTweets = await User.findAll({
        // where: { createdAt: { [Op.gte]: activeTime } },
        include: { 
          model: Tweet,
          where: { // 第二層 where 定義 include進的 model 條件 
            [Op.and]: [
              {
                UserId: { 
                  [Op.in]: subscribes 
                } // 篩選 id 包含在 subscribes 陣列內的
              },
              {
                createdAt: { 
                  [Op.gte]: activeTime 
                }
              }
            ]



            // UserId: { [Op.in]: subscribes }, // 篩選 id 包含在 subscribes 陣列內的
            // createdAt: { [Op.gte]: activeTime }
          } 
        }
      })
      newTweets = newTweets.map(newTweet => ({
        ...newTweet.dataValues,
        type: '有新的訂閱推文事件'
      }))


      return res.json(newTweets)

      // 3.未讀的被讚事件
      let newLikes = await User.findAll({
        // where: {
        //   UserId: userId,
        // },
        include: { 
          model: Like, 
          where: { // 第二層 where 定義 include進的 model 條件 
            createdAt: { [Op.gte]: activeTime } // 篩選按讚時間在 activeTime 之後的事件
          } 
        }
      })
      newLikes = newLikes.map(newLike => ({
        ...newLike.dataValues,
        type: '新的被讚事件',
        
      }))
      
      // return res.json(newLikes)

      // 三個事件結合整理成一個array
      let news = [...newSubs, ...newTweets, ...newLikes]
      news = news.sort((a, b) => a.createdAt - b.createdAt)
      for (let i of news) {
        i.createdAt = chatTime.toTimeOrDatetime(i.createdAt)
      }

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
