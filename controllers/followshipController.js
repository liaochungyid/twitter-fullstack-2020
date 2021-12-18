const followshipService = require('../services/followshipService')

const followshipController = {
  addFollow: async (req, res) => {
    followshipService.addFollow(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect(200, 'back')
      }
    })
  },

  removeFollow: async (req, res) => {
    followshipService.removeFollow(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  }
}

module.exports = followshipController
