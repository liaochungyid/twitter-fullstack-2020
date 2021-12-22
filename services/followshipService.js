const helpers = require('../_helpers')
const db = require('../models')
const { Followship } = db

module.exports = {
  addFollow: async (req, res, callback) => {
    try {
      const followerId = Number(helpers.getUser(req).id)
      const followingId = Number(req.body.id)
      let result = ''

      if (followerId === followingId) {
        result = { status: 'error', message: '不可跟隨自己' }
      } else {
        await Followship.findOrCreate({ where: { followerId, followingId } })
        result = { status: 'success', message: '跟隨成功' }
      }

      return callback(result)
    } catch (err) {
      console.error(err)
    }
  },

  removeFollow: async (req, res, callback) => {
    try {
      const followerId = Number(helpers.getUser(req).id)
      const followingId = Number(req.params.userId)
      await Followship.destroy({ where: { followerId, followingId } })
      const result = { status: 'success', message: '取消跟隨成功' }
      return callback(result)
    } catch (err) {
      console.error(err)
    }
  }
}
