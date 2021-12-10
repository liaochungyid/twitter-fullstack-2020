module.exports = (io) => {
  let onlineUser = []

  io.on('connection', (socket) => {

    updateOnlineUser()
    console.log(socket)

    let user

    socket.on('noti-message-login', (data) => {
      onlineUser.push(data)
      user = data
      socket.emit('noti-message-login', data)
      updateOnlineUser()
    })

    socket.on('send pub msg', (data) => {
      socket.emit('pub msg', data)
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