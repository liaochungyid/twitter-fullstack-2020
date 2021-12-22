const tweetService = require('../../services/tweetService')

const tweetController = {
  addLike: (req, res) => {
    tweetService.addLike(req, res, (data) => {
      return res.json(data)
    })
  },

  removeLike: (req, res) => {
    tweetService.removeLike(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = tweetController
