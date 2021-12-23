const db = require('../models')
const { sequelize } = db

module.exports = {
  getUserTweetCount: () => {
    return sequelize.literal(
      '(SELECT COUNT(*) FROM Tweets WHERE Tweets.UserId = User.id)'
    )
  },

  getUserReplyCount: () => {
    return sequelize.literal(
      '(SELECT COUNT(*) FROM Replies WHERE Replies.UserId = User.id)'
    )
  },

  getUserLikeCount: () => {
    return sequelize.literal(
      '(SELECT COUNT(*) FROM Likes WHERE Likes.UserId = User.id)'
    )
  },

  getUserFollowingCount: () => {
    return sequelize.literal(
      '(SELECT COUNT(*) FROM Followships WHERE Followships.followerId = User.id)'
    )
  },

  getUserFollowerCount: () => {
    return sequelize.literal(
      '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
    )
  },

  getUserIsFollowed: loginUserId => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id AND Followships.followerId = ${loginUserId} LIMIT 1)`
    )
  },

  getTweetReplyCount: () => {
    return sequelize.literal(
      '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
    )
  },

  getTweetLikeCount: () => {
    return sequelize.literal(
      '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)'
    )
  },

  getTweetIsLiked: loginUserId => {
    return sequelize.literal(
      `(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id AND Likes.UserId = ${loginUserId} LIMIT 1)`
    )
  }
}
