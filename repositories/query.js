const db = require('../models')
const { sequelize } = db

module.exports = {
  getUserTweetCount: userId => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Tweets WHERE Tweets.UserId = ${userId})`
    )
  },

  getUserReplyCount: userId => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Replies WHERE Replies.UserId = ${userId})`
    )
  },

  getUserLikeCount: userId => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Likes WHERE Likes.UserId = ${userId})`
    )
  },

  getUserFollowingCount: userId => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Followships WHERE Followships.followerId = ${userId})`
    )
  },

  getUserFollowerCount: userId => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = ${userId})`
    )
  },

  getUserIsFollowed: (userId, loginUserId) => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = ${userId} AND Followships.followerId = ${loginUserId} LIMIT 1)`
    )
  }
}
