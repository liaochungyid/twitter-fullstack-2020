const likeService = require('../services/likeService')

module.exports = {
  addLike: (req, res) => {
    likeService.addLike(req, res, data => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },

  removeLike: (req, res) => {
    likeService.removeLike(req, res, data => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  }
}
