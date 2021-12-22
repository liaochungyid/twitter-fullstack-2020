const userController = require('./userController')

const pageController = {
  getNotis: async (req, res) => {
    try {
      const [pops] = await Promise.all([userController.getPopular(req, res)])
      return res.render('user', {
        pops,
        partial: 'profileNotis'
      })
    } catch (err) {
      console.error(err)
    }
  },

  getChatPublic: (req, res) => {
    return res.render('user', { partial: 'profileChatPub' })
  },

  getChatPrivates: (req, res) => {
    return res.render('user', { partial: 'profileChatPris' })
  }
}

module.exports = pageController
