const db = require('./../models')
const { Message, User } = db

module.exports = (io) => {
  const onlineUser = []

  io.on('connection', (socket) => {
    updateOnlineUser()
    let user

    socket.on('noti-message-login', (data) => {
      onlineUser.push(data)
      user = data
      io.emit('noti-message-login', data)
      updateOnlineUser()
    })

    socket.on('send pub msg', (data) => {
      io.emit('pub msg', data)
    })

    socket.on('disconnect', () => {
      socket.emit('noti-message-logout', user)
      onlineUser.splice(onlineUser.indexOf(user), 1)
      updateOnlineUser()
    })
  })

  function updateOnlineUser() {
    io.emit('onlineUser', onlineUser, { onlineCount: onlineUser.length })
    console.log(onlineUser)
  }
}
