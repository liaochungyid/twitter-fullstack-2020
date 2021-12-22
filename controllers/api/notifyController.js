const helpers = require('../../_helpers')
const db = require('../../models')
const { Notify } = db

module.exports = {
  createNotify: async (req, res) => {
    try {
      const loginUser = helpers.getUser(req).id

      await Notify.create({
        observerId: loginUser,
        observedId: req.params.userId
      })

      return res.json({ status: 'success', message: '已加入關注' })

    } catch (err) {
      console.error(err)
      return res.json({ status: 'error', message: '加入關注失敗' })
    }
  },

  deleteNotify: async (req, res) => {
    try {

      const loginUser = helpers.getUser(req).id

      await Notify.destroy({
        where: {
          observerId: loginUser,
          observedId: req.params.userId
        }
      })

      return res.json({ status: 'success', message: '已移除關注' })

    } catch (err) {
      console.error(err)
      return res.json({ status: 'error', message: '取消關注失敗' })
    }
  },
}
