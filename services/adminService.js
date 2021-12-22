const db = require('../models')
const { User, Tweet, Like } = db

module.exports = {
  getTweets: async (req, res, callback) => {
    try {
      let tweets = await Tweet.findAll({
        attributes: ['id', 'description', 'createdAt'],
        order: [
          ['createdAt', 'DESC']
        ],
        include: [
          { model: User, attributes: ['id', 'name', 'avatar', 'account'] }
        ],
        raw: true,
        nest: true
      })

      tweets = tweets.map((tweet) => ({
        ...tweet,
        description: tweet.description.slice(0, 50)
      }))

      const result = {
        status: 'success',
        message: '取得所有推文成功',
        tweets: tweets,
        partial: 'adminTweets'
      }

      return callback(result)
    } catch (err) {
      console.error(err)
    }
  },

  deleteTweet: async (req, res, callback) => {
    try {
      const tweetId = Number(req.params.tweetId)
      await Tweet.destroy({ where: { id: tweetId } })

      const result = {
        status: 'success',
        message: '刪除一筆推文成功'
      }

      return callback(result)
    } catch (err) {
      console.error(err)
    }
  },

  getUsers: async (req, res, callback) => {
    try {
      let users = await User.findAll({
        include: [
          { model: Tweet, include: [Like], required: false },
          { model: User, as: 'Followings', required: false },
          { model: User, as: 'Followers', required: false }
        ],
        order: [[Tweet, 'createdAt', 'ASC']]
      })

      users = users
        .map((user) => ({
          ...user.dataValues,
          tweetCount: user.Tweets.length,
          likeCount: adminService.sumLikes(
            user.Tweets.map((tweet) => tweet.Likes.length)
          ), // 有寫工具function adminController.sumLikes(arr) 計算加總
          followingCount: user.Followings.length,
          followerCount: user.Followers.length
        }))
        .sort((a, b) => b.tweetCount - a.tweetCount) // 根據tweet數排序

      const result = {
        status: 'success',
        message: '取得所有使用者成功',
        users: users,
        partial: 'adminUsers'
      }

      return callback(result)
    } catch (err) {
      console.error(err)
    }
  },

  sumLikes: (arr) => {
    let likes = 0
    arr.forEach((i) => (likes += i))
    return likes
  }
}
