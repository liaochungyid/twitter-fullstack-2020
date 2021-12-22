const adminService = require('../services/adminService')

module.exports = {
  tweetsPage: async (req, res) => {
    adminService.getTweets(req, res, (data) => {
      if (data.status === 'success') {
        return res.render('admin', data)
      }
    })
  },

  deleteTweet: async (req, res) => {
    adminService.deleteTweet(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('/admin/tweets')
      }
    })
  },

  usersPage: async (req, res) => {
    adminService.getUsers(req, res, (data) => {
      if (data.status === 'success') {
        return res.render('admin', data)
      }
    })
  }
}
