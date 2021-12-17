const helpers = require('../_helpers')
const db = require('../models')
const { Followship } = db

const adminService = require('../services/followshipService')

const followshipController = {
  addFollow: async (req, res) => {
    adminService.addFollow(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
      req.flash('error_messages', data['message'])
      return res.redirect(200, 'back')
    })
  },

  removeFollow: async (req, res) => {
    adminService.removeFollow(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  }
}

module.exports = followshipController
