const db = require('../models')
const { User, Tweet, Like } = db

const adminService = require('../services/adminService')

const adminController = {
  getTweets: async (req, res) => {
    adminService.getTweets(req, res, (data) => {
      return res.render('admin', data)
    })
  },

  deleteTweet: async (req, res) => {
    adminService.deleteTweet(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/tweets')
      }
    })
  },

  adminUsers: async (req, res) => {
    try {
      let users = await User.findAll({
        include: [
          { model: Tweet, include: [Like], required: false },
          { model: User, as: 'Followings', required: false },
          { model: User, as: 'Followers', required: false }
        ],
        order: [[Tweet, 'createdAt', 'ASC']]
      })

      users = users
        .map((user) => ({
          ...user.dataValues,
          tweetCount: user.Tweets.length,
          likeCount: adminController.sumLikes(
            user.Tweets.map((tweet) => tweet.Likes.length)
          ), // 有寫工具function adminController.sumLikes(arr) 計算加總
          followingCount: user.Followings.length,
          followerCount: user.Followers.length
        }))
        .sort((a, b) => b.tweetCount - a.tweetCount) // 根據tweet數排序

      return res.render('admin', { users, partial: 'adminUsers' })
      // return res.json(users)
    } catch (err) {
      console.error(err)
    }
  },

  sumLikes: (arr) => {
    let likes = 0
    arr.forEach((i) => (likes += i))
    return likes
  }
}

module.exports = adminController
