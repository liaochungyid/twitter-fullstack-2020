const helpers = require('../../_helpers')
const db = require('../../models')
const { User, Tweet } = db

const adminController = {
  getTweets: async (req, res) => {
    try {
      let tweets = await Tweet.findAll({
        attributes: ['id', 'description', 'createdAt'],
        order: [['createdAt', 'DESC']],
        include: [{ model: User, attributes: ['id', 'name', 'avatar', 'account'] }],
        raw: true,
        nest: true
      })

      tweets = tweets.map((tweet) => ({
        ...tweet,
        description: tweet.description.slice(0, 50)
      }))

      return res.json({ tweets, partial: 'adminTweets' })
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = adminController