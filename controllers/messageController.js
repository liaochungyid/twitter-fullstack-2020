module.exports = {
  getChatPrivates: (req, res) => {
    return res.render('user', { partial: 'profileChatPris' })
  }
}
