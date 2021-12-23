const userService = require('../services/userService')

module.exports = {
  notificationsPage: async (req, res) => {
    try {
      const [pops] = await Promise.all([userService.getPopular(req, res)])
      return res.render('user', {
        pops,
        partial: 'profileNotis'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
