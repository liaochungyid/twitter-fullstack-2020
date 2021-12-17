const helpers = require('../../_helpers')
const db = require('../../models')
const { Followship } = db

const adminService = require('../../services/followshipService')

const followshipController = {
  addFollow: async (req, res) => {
    adminService.addFollow(req, res, (data) => {
      return res.json(data)
    })
  },

  removeFollow: async (req, res) => {
    adminService.removeFollow(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = followshipController
