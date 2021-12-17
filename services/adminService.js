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

      return callback({ tweets, partial: 'adminTweets' })
    } catch (err) {
      console.error(err)
    }
  },

  deleteTweet: async (req, res, callback) => {
    try {
      const tweetId = Number(req.params.tweetId)
      await Tweet.destroy({ where: { id: tweetId } })
      return callback({ status: 'success', message: ''})
    } catch (err) {
      console.error(err)
    }
  },

  // adminUsers 改成 getUsers！

}

module.exports = adminService