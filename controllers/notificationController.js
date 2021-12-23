module.exports = {
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
  }
}
