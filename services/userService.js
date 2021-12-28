const helpers = require('../_helpers')
const constants = require('../config/constants')
const query = require('../repositories/query')

const db = require('../models')
const { sequelize } = db
const { Op } = db.Sequelize
const { User, Followship, Notification } = db

module.exports = {
  getUserProfile: async (req, res) => {
    try {
      const userId = Number(req.params.userId)
      const user = await User.findByPk(userId, {
        attributes: {
          include: [
            [query.getUserTweetCount(), 'tweetCount'],
            [query.getUserReplyCount(), 'replyCount'],
            [query.getUserLikeCount(), 'likeCount'],
            [query.getUserFollowingCount(), 'followingCount'],
            [query.getUserFollowerCount(), 'followerCount'],
            [query.getUserIsFollowed(helpers.getUser(req).id), 'isFollowed']
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

  getPopular: async (req, res) => {
    try {
      const offsetCounter = req.params.offset * constants.popularPerPage
      const myId = String(helpers.getUser(req).id)

      let pops = await User.findAll({
        where: {
          id: { [Op.not]: myId },
          role: { [Op.not]: 'admin' }
        },
        attributes: [
          'id',
          'name',
          'avatar',
          'account',
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
            ),
            'followerCount'
          ]
        ],
        order: [[sequelize.literal('followerCount'), 'DESC']],
        limit: constants.popularPerPage,
        offset: offsetCounter || 0
      })

      let followings = await Followship.findAll({
        where: { followerId: helpers.getUser(req).id }
      })
      followings = followings.map(following => following.dataValues.followingId)

      pops = pops.map(pop => ({
        ...pop.dataValues,
        isFollowing: followings.includes(pop.dataValues.id)
      }))

      return pops // 返回前10 popular array
    } catch (err) {
      console.error(err)
    }
  },

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
