const db = require('../models')
const { User, Tweet } = db

const adminService = {
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
  }

  // adminUsers 改成 getUsers！

}

module.exports = adminService
