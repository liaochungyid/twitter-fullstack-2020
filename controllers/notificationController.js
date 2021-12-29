module.exports = {
  notificationsPage: (req, res) => {
    return res.render('user', { partial: 'profileNotis' })
  }
}
