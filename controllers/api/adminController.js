const db = require('../../models')
const { User, Tweet } = db

const adminService = require('../../services/adminService')

const adminController = {
  getTweets: async (req, res) => {
    adminService.getTweets(req, res, (data) => {
      return res.json(data)
    })
  },
  
  deleteTweet: async (req, res) => {
    adminService.deleteTweet(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = adminController