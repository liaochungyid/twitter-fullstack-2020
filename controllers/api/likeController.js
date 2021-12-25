const likeService = require('../../services/likeService')

module.exports = {
  addLike: async (req, res) => {
    likeService.addLike(req, res, data => {
      return res.json(data)
    })
  },

  removeLike: async (req, res) => {
    likeService.removeLike(req, res, data => {
      return res.json(data)
    })
  }
}
