const userService = require('../services/userService')

module.exports = {
  notificationsPage: async (req, res) => {
    try {
      return res.render('user', {
        partial: 'profileNotis'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
