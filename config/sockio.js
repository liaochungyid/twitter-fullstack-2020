const { Op } = require('sequelize')
const db = require('./../models')
const { Message, User, PrivateMessage } = db

module.exports = (io) => {
  const onlineUser = []

  io.on('connection', async (socket) => {
    let user

    // 使用者上線
    socket.on('connectUser', async (userId) => {
      user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'account', 'avatar'],
        raw: true
      })
      io.emit('notifySignin', user)
      broadcastOnlineUser(user)

      // 使用者下線
      socket.on('disconnect', () => {
        io.emit('notifySignout', user)
        broadcastOnlineUser(undefined, user)
      })

      // 取得歷史訊息
      const previousMessages = await Message.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'account', 'avatar']
          }
        ],
        attributes: ['id', 'text', 'createdAt'],
        order: [['createdAt', 'ASC']],
        raw: true,
        nest: true
      })
      io.emit('getPreviousMessages', previousMessages)
    })

    // 建立訊息
    socket.on('createMessage', async (data) => {
      try {
        const query = await Message.create({
          UserId: data.UserId,
          text: data.text
        })
        console.log('createMessage')
        // 確定建立完資料，才把資料拿出來
        const newMessage = await Message.findOne({
          where: {
            ...query.dataValues
          },
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            }
          ],
          raw: true,
          nest: true
        })

        io.emit('getNewMessage', newMessage)
      } catch (err) {
        console.error(err)
      }
    })

    // ------------- 以下 Pri chatroom -------------
    let room = []
    let opUsers = []

    // 有user連線到 profileChatPris page
    socket.on('connectUserPri', async (userId) => {
      let priMsg = await PrivateMessage.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        raw: true,
        order: [['createdAt', 'DESC']]
      })

      // 找出room組合 及所有不是自己的user
      priMsg.forEach(item => {
        room.push(item.senderId < item.receiverId ? item.senderId + '=' + item.receiverId : item.receiverId + '=' + item.senderId)

        if (Number(item.senderId) !== Number(userId)) {
          opUsers.push(item.senderId)
        } else {
          opUsers.push(item.receiverId)
        }

      })
      // 清除重複
      room = [...(new Set(room))]
      opUsers = [...(new Set(opUsers))]

      // 加入連線
      socket.join(room)

      opUsers = await Promise.all(opUsers.map(id => {
        return User.findByPk(id, { raw: true })
      }))

      // 發出對應使用者 render usercard
      socket.emit(`pri users for ${userId}`, opUsers)

    })

    // 進入聊天室 回傳聊天紀錄
    socket.on('connectUserPriRoom', async (data) => {
      const { onlineUserId, roomid, opId } = data

      let [priMsg, opUser] = await Promise.all([
        PrivateMessage.findAll({
          where: {
            [Op.or]: [
              { senderId: onlineUserId, receiverId: opId },
              { senderId: opId, receiverId: onlineUserId }
            ]
          },
          raw: true,
          order: [['createdAt', 'ASC']]
        }),
        User.findByPk(opId)
      ])

      io.to(roomid).emit('getPriPreMsg', { priMsg, opUser })
    })

    // 建立訊息
    socket.on('createPriMsg', async (data) => {
      try {
        const roomid = data.roomid
        const receiver = await decodeRoomId(roomid, data.senderId)
        delete data.roomid
        data.receiverId = receiver.id
        const query = await PrivateMessage.create(data)
        // console.log('----------------------')
        // console.log(query)
        // 確定建立完資料，才把資料拿出來`，一直錯誤 仙註解掉
        // const newMessage = PrivateMessage.findOne({
        //   where: { ...query.dataValues },
        //   raw: true,
        //   nest: true
        // })
        const newMessage = query.toJSON()

        io.to(roomid).emit('getNewPriMsg', { newMessage, receiver })

      } catch (err) {
        console.error(err)
      }
    })



  })


  function broadcastOnlineUser(userON, userOFF = undefined) {
    if (userON) { onlineUser.push(userON) }
    if (userOFF) {
      onlineUser
        .splice(onlineUser.indexOf(userOFF), 1)
    }
    return io.emit('getOnlineUser', {
      onlineUser,
      onlineUserCount: onlineUser.length
    })
  }

  async function decodeRoomId(roomid, gotId = false) {
    // 接收roomid 拆成兩個user model回傳
    // 或gotId有給時 僅回傳另一個
    const index = roomid.indexOf('=')
    let fid = Number(roomid.slice(0, index))
    let bid = Number(roomid.slice(index + 1))
      ;[fid, bid] = await Promise.all([
        User.findByPk(fid, { raw: true }),
        User.findByPk(bid, { raw: true })
      ])
    if (gotId) {
      return fid.id = Number(gotId) ? bid : fid
    } else {
      console.log({ fid, bid })
      return { fid, bid }
    }
  }
}
