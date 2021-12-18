const followshipService = require('../../services/followshipService')

const followshipController = {
  addFollow: async (req, res) => {
    followshipService.addFollow(req, res, (data) => {
      return res.json(data)
    })
  },

  removeFollow: async (req, res) => {
    followshipService.removeFollow(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = followshipController
