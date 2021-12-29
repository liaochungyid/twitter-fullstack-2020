const helpers = require('../_helpers')

const db = require('../models')
const { Notification } = db

module.exports = {
  getUserIsNotified: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      const isNotified = await Notification.count({
        where: {
          observerId: userId,
          observedId: req.params.userId
        }
      })

      return isNotified
    } catch (err) {
      console.error(err)
    }
  }
}
