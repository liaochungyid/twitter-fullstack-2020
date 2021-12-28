const db = require('../models')
const { User, Tweet, Reply } = db

module.exports = {
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
  }
}
