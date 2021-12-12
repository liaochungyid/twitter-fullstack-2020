const { Op, NONE } = require('sequelize')
const { getUserTweets } = require('../controllers/userController')
const { sequelize } = require('./../models')
const db = require('./../models')
const { Message, User, PrivateMessage, Notify, Tweet } = db
const chatTime = require('./chatTime')

module.exports = (io) => {
  // 群聊使用者
  const onlineUser = []
  // 私聊房間
  let room = []
  // 登入使用者
  const UL = new Set()

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

      previousMessages.forEach((msg) => {
        msg.createdAt = chatTime.chatTime(msg.createdAt)
      })
      console.log(previousMessages)

      io.emit('getPreviousMessages', previousMessages)
    })

    // 建立訊息
    socket.on('createMessage', async (data) => {
      try {
        const query = await Message.create({
          UserId: data.UserId,
          text: data.text
        })
        // console.log('createMessage')
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

        newMessage.createdAt = chatTime.msgTime(newMessage.createdAt)

        io.emit('getNewMessage', newMessage)
      } catch (err) {
        console.error(err)
      }
    })

    // ------------- 以下 Pri chatroom -------------

    // 有user連線到 profileChatPris page
    socket.on('connectUserPri', async (userId) => {
      let opUsers = []
      let selfroom = []

      let priMsg = await PrivateMessage.findAll({
        where: {
          [Op.or]: [{ senderId: userId }, { receiverId: userId }]
        },
        raw: true,
        order: [['createdAt', 'DESC']]
      })

      // 找出room組合 及所有不是自己的user
      priMsg.forEach((item) => {
        room.push(
          item.senderId < item.receiverId
            ? item.senderId + '=' + item.receiverId
            : item.receiverId + '=' + item.senderId
        )

        if (Number(item.senderId) !== Number(userId)) {
          opUsers.push(item.senderId)
        } else {
          opUsers.push(item.receiverId)
        }
      })
      // 清除重複

      selfroom = [...(new Set(selfroom))]
      opUsers = [...(new Set(opUsers))]

      // 加入連線
      // room 重複加?
      room = room.concat(...selfroom)
      socket.join(room)
      console.log('room: ', room)
      console.log('selfroom', selfroom)

      opUsers = await Promise.all(
        opUsers.map((id) => {
          return User.findByPk(id, { raw: true })
        })
      )

      const loginUserId = Number(userId)
      const privateMessages = await PrivateMessage.findAll({
        attributes: [
          'id',
          'senderId',
          'receiverId',
          'text',
          'unread',
          'createdAt',
          'updatedAt'
        ],
        where: {
          [Op.or]: [{ senderId: loginUserId }, { receiverId: loginUserId }]
        },
        order: [['createdAt', 'DESC']],
        raw: true
      })

      console.log('privateMessages.length', privateMessages.length)
      const records = []
      const showedPrivateMessages = []

      for (let i = 0; i < privateMessages.length; i++) {
        const senderId = Number(privateMessages[i].senderId)
        const receiverId = Number(privateMessages[i].receiverId)
        if (senderId === loginUserId) {
          if (!records.includes(receiverId)) {
            records.push(receiverId)
            const showedUser = await User.findByPk(receiverId).then((result) =>
              result.toJSON()
            )

            const appended = {
              pmId: privateMessages[i].id,
              isIt: false,
              text: privateMessages[i].text,
              unread: privateMessages[i].unread,
              createdAt: chatTime
                .msgTime(privateMessages[i].createdAt)
                .replace(' ', '')
            }

            showedPrivateMessages.push({
              ...showedUser,
              ...appended
            })
          }
        } else {
          if (!records.includes(senderId)) {
            records.push(senderId)
            const showedUser = await User.findByPk(senderId).then((result) =>
              result.toJSON()
            )

            const appended = {
              pmId: privateMessages[i].pmId,
              isIt: false,
              text: privateMessages[i].text,
              unread: privateMessages[i].unread,
              createdAt: chatTime.msgTime(privateMessages[i].createdAt).replace(' ', '')
            }

            showedPrivateMessages.push({
              ...showedUser,
              ...appended
            })
          }
        }
      }
      
      // 離線移除自己的room (兩人同時上線room會有兩個 selfroom只會有一個)
      socket.on('disconnect', () => {
        selfroom.forEach(r => {
          room.splice(r.indexOf(), 1)
        })
        socket.join(room.concat(...selfroom))
      })

      // 發出對應使用者 render usercard
      socket.emit(`pri users for ${userId}`, showedPrivateMessages)
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

      room = room.concat(roomid)
      socket.join(room)

      priMsg.forEach((msg) => {
        msg.createdAt = chatTime.chatTime(msg.createdAt)
      })

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
        // console.log(receiver)
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

    // send 訊息後，若有reciever接收到 回傳priMsg id 修改unread狀態
    socket.on('setMsgRead', (readMsg) => {
      readMsg.forEach((item) => {
        PrivateMessage.update(
          { 'unread': false },
          { where: item }
        )
      })
    })

    // ------------- 以下 userlogin -------------
    socket.on('userLogin', async (userloginId) => {
      // console.log(data, typeof data)
      UL.add(Number(userloginId))
      socket.join(userloginId)
      broadcastOnlineUser(false)

      socket.on('disconnect', () => {
        UL.delete(Number(userloginId))
        socket.leave(userloginId)
        broadcastOnlineUser(false)
      })

      // 資料庫找未讀 通知
      try {
        const userlogin = await User.findAll({
          where: { id: Number(userloginId) },
          attributes: ['id'],
          include: [
            {
              model: User,
              as: 'observeds',
              attributes: ['id', 'name', 'avatar'],
              require: false
            }
          ]
        })

        // 未讀 通知 傳回原本user
        io.to(userloginId).emit('notiNoti', ...userlogin)
      } catch (err) {
        console.log(err)
      }

      // 資料庫找未讀 私訊
      try {
        const mMsgUnread = await PrivateMessage.findAll({
          where: {
            receiverId: Number(userloginId),
            unread: true
          },
          raw: true
        })

        // 未讀 私訊 傳回原本user
        io.to(userloginId).emit('PriChatNoti', mMsgUnread)
      } catch (err) {
        console.log(err)
      }
    })
  })

  function broadcastOnlineUser(userON, userOFF = undefined) {
    if (userON) {
      onlineUser.push(userON)
    }
    if (userOFF) {
      onlineUser.splice(onlineUser.indexOf(userOFF), 1)
    }

    // 廣播所有login的user
    io.to([...UL].map((r) => String(r))).emit('pubChatNoti', onlineUser.length)

    if (!userON & !userOFF) return true

    // 廣播到public頻道
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
      return fid.id === Number(gotId) ? bid : fid
    } else {
      // console.log({ fid, bid })
      return { fid, bid }
    }
  }



}
