const followshipService = require('../services/followshipService')
const userService = require('../services/userService')

module.exports = {
  followersPage: async (req, res) => {
    try {
      const [user, followers] = await Promise.all([
        userService.getUserProfile(req, res),
        followshipService.getUserFollowers(req, res)
      ])
      return res.render('user', {
        user,
        followers,
        partial: 'profileFollower'
      })
    } catch (err) {
      console.error(err)
    }
  },

  followingsPage: async (req, res) => {
    try {
      const [user, followings] = await Promise.all([
        userService.getUserProfile(req, res),
        followshipService.getUserFollowings(req, res)
      ])
      return res.render('user', {
        user,
        followings,
        partial: 'profileFollowing'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
