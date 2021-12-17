const helpers = require('../_helpers')
const db = require('../models')
const { Followship } = db

const followshipService = {
  addFollow: async (req, res, callback) => {
    try {
      const followerId = Number(helpers.getUser(req).id)
      const followingId = Number(req.body.id)

      if (followerId === followingId) {
        return callback({ status: 'error', message: '不可跟隨自己' })
      }

      await Followship.findOrCreate({ where: { followerId, followingId } })
      return callback({ status: 'success', message: '' })
    } catch (err) {
      console.error(err)
    }
  },

  removeFollow: async (req, res, callback) => {
    try {
      const followerId = Number(helpers.getUser(req).id)
      const followingId = Number(req.params.userId)
      await Followship.destroy({ where: { followerId, followingId } })
      return callback({ status: 'success', message: '' })
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = followshipService
