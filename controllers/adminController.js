const db = require('../models')
const { User, Tweet, Like } = db

const adminService = require('../services/adminService')

const adminController = {
  getTweets: async (req, res) => {
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

  getUsers: async (req, res) => {
    adminService.getUsers(req, res, (data) => {
      if (data.status === 'success') {
        return res.render('admin', data)
      }
    })
  }
}

module.exports = adminController
