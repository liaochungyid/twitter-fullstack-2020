module.exports = {
  getChatPublic: (req, res) => {
    return res.render('user', { partial: 'profileChatPub' })
  }
}
