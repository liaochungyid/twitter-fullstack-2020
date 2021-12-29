const socketService = require('./socketService')

module.exports = io => {
  const notiOnlineUsers = []
  const publicOnlineUsers = []

  io.on('connection', socket => {
    // userId and roomId for this connection
    let userId
    let roomId

    // ------------- noti -------------
    // user 進入noti page 更新activeTime
    socket.on('updateActiveTime', userId => {
      socketService.updateActiveTime(userId)
    })

    socket.on('connectLogin', loginUserId => {
      // 登入，加入清單 notiOnlineUsers，建立room
      notiOnlineUsers.push(loginUserId)
      userId = loginUserId
      socket.join(userId)

      // 離線，移除登入清單 notiOnlineUsers
      socket.on('disconnect', reason => {
        notiOnlineUsers.splice(notiOnlineUsers.indexOf(userId), 1)
      })

      // 送出歷史通知 (Public, Private, Noti)
      Promise.all([
        socketService.getPrivateNoti(userId),
        socketService.getNotiNoti(userId)
      ]).then(results => {
        io.to(userId).emit('getPreviousNoti', {
          getPublicNoti: publicOnlineUsers.length !== 0,
          getPrivateNoti: results[0],
          getNotiNoti: results[1]
        })
      })
    })

    // ------------- public -------------

    socket.on('connectPublicUser', async loginUserId => {
      // 上線加入清單
      publicOnlineUsers.push(loginUserId)
      const user = await socketService.getUserInfo(loginUserId)

      // 送出public歷史訊息
      io.emit('getPreviousMessages', await socketService.getPreviousMsg())

      // 發送更新左列選單通知綠點
      io.emit('updatePublicNoti',
        publicOnlineUsers.length !== 0)

      // 送出public已在線使用者
      io.emit(
        'getConnectedPublicUser',
        await socketService.getPreviousUser(publicOnlineUsers)
      )

      // 廣播自己上線
      io.emit('getPublicMsg', { notifyType: 'signin', user })

      // 離線移除清單，廣播
      socket.on('disconnect', async reason => {
        publicOnlineUsers.splice(publicOnlineUsers.indexOf(loginUserId), 1)

        io.emit('getPublicMsg', { notifyType: 'signout', user })

        io.emit(
          'getConnectedPublicUser',
          await socketService.getPreviousUser(publicOnlineUsers)
        )

        // 發送更新左列選單通知綠點
        io.emit('updatePublicNoti',
          publicOnlineUsers.length !== 0)
      })

      // 接收public訊息，儲存，廣播
      socket.on('createPublicMsg', async data => {
        const [msg, user] = await Promise.all([
          socketService.createChat(data),
          socketService.getUserInfo(data.UserId)
        ])

        io.emit('getPublicMsg', { notifyType: 'message', msg, user })
      })
    })

    // ------------- private -------------
    socket.on('getConnectedPrivateUser', async loginUserId => {
      // 送出private 聊天過的使用者紀錄
      io.emit(
        `getConnectedPrivateUser${loginUserId}`,
        await socketService.getPreviousPrivateUsers(loginUserId)
      )
    })

    socket.on('connectPrivateUser', async data => {
      // 如有先前連線roomId，先斷開
      if (roomId) {
        socket.leave(roomId)
        socket.removeAllListeners('createPrivateMsg')
        socket.removeAllListeners('updateReadMsg')
      }

      // 上線加入清單
      const loginUserId = Number(data.loginUserId)
      const opId = Number(data.opId)
      roomId = await creatRoomId(loginUserId, opId)

      socket.join(roomId)

      // 送出private 歷史訊息
      io.to(roomId).emit('getPreviousPrivateMsg', {
        msg: await socketService.getPreviousMsg([loginUserId, opId]),
        op: await socketService.getUserInfo(opId)
      })

      // 接收private訊息，儲存，廣播
      socket.on('createPrivateMsg', async data => {
        const [msg, op] = await Promise.all([
          socketService.createMessage(data),
          socketService.getUserInfo(data.senderId)
        ])

        io.to(roomId).emit('getPrivateMsg', { msg, op })
        // 更新對方privateNoti (數量+1)
        io.to(data.receiverId).emit('updatePrivateNoti', 1)
      })

      // 已讀訊息更新
      socket.on('updateReadMsg', async data => {
        socketService.updateReadMsg(data)

        // 發送更新左列選單通知數量
        io.to(userId).emit('updatePrivateNoti', -data.length)
      })
    })
  })

  // -------------functions-------------
  async function creatRoomId (userId, opId) {
    // 生成roomId
    return userId < opId ? userId + '=' + opId : opId + '=' + userId
  }
}
