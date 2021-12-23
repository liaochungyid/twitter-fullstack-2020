module.exports = {
  chatroomPage: (req, res) => {
    return res.render('user', { partial: 'profileChatPub' })
  }
}
