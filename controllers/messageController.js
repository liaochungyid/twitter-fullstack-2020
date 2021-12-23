module.exports = {
  messagesPage: (req, res) => {
    return res.render('user', { partial: 'profileChatPris' })
  }
}
