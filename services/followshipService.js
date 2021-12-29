const helpers = require('../_helpers')

const db = require('../models')
const { sequelize } = db
const { User, Followship } = db

module.exports = {
  addFollow: async (req, res, callback) => {
    try {
      const followerId = Number(helpers.getUser(req).id)
      const followingId = Number(req.params.userId)
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
  }
}
