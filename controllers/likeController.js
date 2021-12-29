const notificationService = require('../services/notificationService')
const likeService = require('../services/likeService')
const userService = require('../services/userService')

module.exports = {
  likesPage: async (req, res) => {
    try {
      const [user, tweets, isNotified] = await Promise.all([
        userService.getUserProfile(req, res),
        likeService.getUserLikes(req, res),
        notificationService.getUserIsNotified(req, res)
      ])
      return res.render('user', {
        user,
        tweets,
        isNotified,
        partial: 'profileLikes'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
