const helpers = require('../_helpers')

const db = require('../models')
const { sequelize } = db
const { User, Tweet, Reply, Like, Followship, Notify } = db

const query = require('../repositories/query')

module.exports = {
  getUserProfile: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      const user = await User.findByPk(userId, {
        attributes: {
          include: [
            [query.getUserTweetCount(userId), 'tweetCount'],
            [query.getUserReplyCount(userId), 'replyCount'],
            [query.getUserLikeCount(userId), 'likeCount'],
            [query.getUserFollowingCount(userId), 'followingCount'],
            [query.getUserFollowerCount(userId), 'followerCount'],
            [query.getUserIsFollowed(userId, helpers.getUser(req).id), 'isFollowed']
          ],
          exclude: [
            'email',
            'password',
            'role',
            'activeTime',
            'createdAt',
            'updatedAt'
          ]
        },
        raw: true
      })
      return user
    } catch (err) {
      console.error(err)
    }
  },

  getUserTweets: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      const tweets = await Tweet.findAll({
        where: { UserId: userId },
        attributes: [
          'id',
          'description',
          'createdAt',
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
            ),
            'replyCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)'
            ),
            'likeCount'
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id AND Likes.UserId = ${
                helpers.getUser(req).id
              } LIMIT 1)`
            ),
            'isLiked'
          ]
        ],
        order: [['createdAt', 'DESC']],
        raw: true
      })
      return tweets
    } catch (err) {
      console.error(err)
    }
  },

  getUserReplies: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      let replies = await Reply.findAll({
        where: { UserId: userId },
        attributes: ['id', 'comment', 'createdAt'],
        include: [
          {
            model: Tweet,
            attributes: ['id'],
            include: [{ model: User, attributes: ['id', 'account'] }]
          }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      })

      replies = replies.map(reply => ({
        id: reply.id,
        comment: reply.comment,
        createdAt: reply.createdAt,
        toAccount: reply.Tweet.User.account,
        toId: reply.Tweet.User.id
      }))

      return replies
    } catch (err) {
      console.error(err)
    }
  },

  getUserLikes: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      const likes = await Like.findAll({
        where: { UserId: userId },
        attributes: ['createdAt'],
        include: [
          {
            model: Tweet,
            attributes: [
              'id',
              'description',
              'createdAt',
              [
                sequelize.literal(
                  '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
                ),
                'replyCount'
              ],
              [
                sequelize.literal(
                  '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)'
                ),
                'likeCount'
              ],
              [
                sequelize.literal(
                  `(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id AND Likes.UserId = ${
                    helpers.getUser(req).id
                  } LIMIT 1)`
                ),
                'isLiked'
              ]
            ],
            require: false
          }
        ],
        raw: true,
        nest: true
      })
      const tweets = likes
        .map(like => ({
          id: like.Tweet.id,
          description: like.Tweet.description,
          replyCount: like.Tweet.replyCount,
          likeCount: like.Tweet.likeCount,
          isLiked: like.Tweet.isLiked,
          likeCreatedAt: like.createdAt
        }))
        .sort((a, b) => b.likeCreatedAt - a.likeCreatedAt)
      return tweets
    } catch (err) {
      console.error(err)
    }
  },

  getUserFollowers: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      const followship = await User.findByPk(userId, {
        attributes: [],
        include: [
          {
            model: User,
            as: 'Followers',
            attributes: [
              'id',
              'name',
              'avatar',
              'introduction',
              'account',
              [
                sequelize.literal(
                  `(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = Followers.id AND Followships.followerId = ${
                    helpers.getUser(req).id
                  } LIMIT 1)`
                ),
                'isFollowed'
              ]
            ],
            require: false
          }
        ]
      })
      let followers = followship.toJSON().Followers

      followers = followers.map(follower => ({
        id: follower.id,
        name: follower.name,
        avatar: follower.avatar,
        introduction: follower.introduction,
        account: follower.account,
        followshipCreatedAt: follower.Followship.createdAt,
        isFollowed: follower.isFollowed
      }))

      followers = followers.sort(
        (a, b) => b.followshipCreatedAt - a.followshipCreatedAt
      )

      return followers
    } catch (err) {
      console.error(err)
    }
  },

  getUserFollowings: async (req, res) => {
    try {
      const UserId = Number(req.params.userId)
      let followings = await User.findAll({
        where: { id: UserId },
        attributes: [],
        include: [
          {
            model: User,
            as: 'Followings',
            attributes: ['id', 'name', 'avatar', 'introduction', 'account'],
            require: false
          }
        ]
      })

      let followingsList = await Followship.findAll({
        where: { followerId: helpers.getUser(req).id }
      })
      followingsList = followingsList.map(data => data.dataValues.followingId)

      followings = followings[0].dataValues.Followings.map(following => ({
        id: following.id,
        name: following.name,
        avatar: following.avatar,
        introduction: following.introduction,
        account: following.account,
        followshipCreatedAt: following.Followship.createdAt,
        isFollowed: followingsList.includes(
          Number(following.Followship.followingId)
        )
      }))

      followings = followings.sort(
        (a, b) => b.followshipCreatedAt - a.followshipCreatedAt
      )

      return followings
    } catch (err) {
      console.error(err)
    }
  },

  getPopular: async (req, res) => {
    try {
      let pops = await User.findAll({
        attributes: [
          'id',
          'email',
          'name',
          'avatar',
          'account',
          'role',
          'createdAt',
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
            ),
            'followerCount'
          ]
        ]
      })

      let followings = await Followship.findAll({
        where: { followerId: helpers.getUser(req).id }
      })
      followings = followings.map(following => following.dataValues.followingId)

      pops = pops.filter(pop => pop.dataValues.role !== 'admin')
      pops = pops.filter(pop => pop.dataValues.id !== helpers.getUser(req).id)
      pops = pops
        .map(pop => ({
          ...pop.dataValues,
          isFollowing: followings.includes(pop.dataValues.id)
        }))
        .sort((a, b) => b.followerCount - a.followerCount)
        .slice(0, 10)

      return pops // 返回前10 populars array
    } catch (err) {
      console.error(err)
    }
  },

  getUserIsNotify: async (req, res) => {
    try {
      const userId = helpers.getUser(req).id
      const isNotify = await Notify.count({
        where: {
          observerId: userId,
          observedId: req.params.userId
        }
      })

      return isNotify
    } catch (err) {
      console.error(err)
    }
  }
}
