const adminService = require('../../services/adminService')

module.exports = {
  getTweets: async (req, res) => {
    adminService.getTweets(req, res, data => {
      return res.json(data)
    })
  },

  deleteTweet: async (req, res) => {
    adminService.deleteTweet(req, res, data => {
      return res.json(data)
    })
  }
}
