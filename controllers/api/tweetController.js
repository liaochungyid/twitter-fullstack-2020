const tweetService = require('../../services/tweetService')

module.exports = {
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
