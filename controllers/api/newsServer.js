const helpers = require('../../_helpers')
const db = require('../../models')
const { User, Tweet, Notify, Like } = db
const chatTime = require('../../config/chatTime')

const tweetController = {
  getNew: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id 
      
      let activeTime = await User.findAll({ where: {id: userId} })
      activeTime = activeTime[0].activeTime // 取得登入者上次活動時間 datetime

      let notifies = await Notify.findAll({ where: {observerId: userId} })
      notifies = notifies.map(notify => ({ 
         ...notify.dataValues,
      }))
      subscribes = notifies.map(sub => sub.observedId) // 取得訂閱名單 array
      
      // 修改關聯性後再加入 未讀的被追蹤事件
      // let subscribers = await Notify.findAll({ 
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
      newTweets = newTweets.filter(newTweet => (newTweet.createdAt - activeTime) > 0)
      newTweets = newTweets.filter(newTweet => subscribes.includes(newTweet.UserId))

      let newLikes = await Like.findAll({ include: [{ model: User }] })
      newLikes = newLikes.map(newLike => ({
        ...newLike.dataValues,
        type: '未讀的被讚事件'
      }))
      newLikes = newLikes.filter(newLike => (newLike.createdAt - activeTime) > 0)

      // 三個事件結合整理成一個array
      let news = [ ...newTweets, ...newLikes] // 預計設訂閱關聯性以後加入 ...subscribers, 
      news = news.sort((a, b) => a.createdAt - b.createdAt)
      news.forEach(n => { n.createdAt = chatTime.msgTime(n.createdAt) })
            
      return res.json(news)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = tweetController