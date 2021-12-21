module.exports = (io) => {
  const notiOnlineUser = []
  const publicOnlineUser = []
  const privateOnlineUser = []

  io.on('connection', (socket) => {
    // userId for this connection
    let userId

    // updateOnlineUser()
    // console.log(socket)

    // let user

    // socket.on('connectLogin', (data) => {
    //   onlineUser.push(data)
    //   user = data
    //   socket.emit('noti-message-login', data)
    //   updateOnlineUser()
    // })

    // socket.on('send pub msg', (data) => {
    //   socket.emit('pub msg', data)
    // })

    // socket.on('disconnect', () => {
    //   socket.emit('noti-message-logout', user)
    //   onlineUser.splice(onlineUser.indexOf(user), 1)
    //   updateOnlineUser()
    // })



    // ------------- noti -------------
    socket.on('connectLogin', userloginId => {
      // 登入，加入清單 notiOnlineUser，建立room
      notiOnlineUser.push(userloginId)
      userId = userloginId
      socket.join(userId)

      // 離線，移除登入清單 notiOnlineUser
      socket.on('disconnect', (reason) => {
        notiOnlineUser
          .splice(notiOnlineUser.indexOf(userId), 1)
      })

      // 這裡需要 getPublicNoti getPrivateNoti getNotiNoti 三個service，以 .length回傳數量
      // 送出歷史通知 (Public, Private, Noti)
      io.to(userId).emit('getPreviousNoti', {
        getPublicNoti: true,
        getPrivateNoti: 10,
        getNotiNoti: 5
      })
    })

    function broadcastNotiNoti(userIdList, data) {
      // data require type('未讀的追蹤者推文' or '未讀的被讚事件'), TweetId, Tweet(all) User(avatar, name)
      io.to(userIdList).emit('getNotiNoti', data)
    }

    function broadcastPrivateNoti(roomList, userIdList, data) {
      // data require receiverId, text, date, time
      io.to(roomList).emit('getPrivateNoti', data)
      io.to(userIdList).emit('getPrivateNoti', true)
    }

    function broadcastPublicNoti(userIdList, data) {
      // data require text, userId, date, time, user(name, account, avatar)
      io.emit('getPublicNoti', data)
      io.to(userIdList).emit('getPublicNoti', true)
    }

    
  })

  // function updateOnlineUser() {
  //   io.emit('onlineUser', onlineUser, { onlineCount: onlineUser.length })
  //   console.log(onlineUser)
  // }

  
}