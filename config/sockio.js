const db = require('./../models')
const { Message, User } = db

module.exports = (io) => {
  const onlineUsers = []

  io.on('connection', async (socket) => {
    updateOnlineUser()
    let user

    // 使用者上線
    socket.on('connectUser', async (data) => {
      await user
      io.emit('notification', `${data.name} 上線`)

      onlineUsers.push(data)
      user = data
      // io.emit('noti-message-login', data)
      // updateOnlineUser()
    })

    // socket.on('send pub msg', (data) => {
    //   io.emit('pub msg', data)
    // })

    socket.on('test', () => {
      console.log(user)
    })

    // 取得歷史訊息
    const previousMessages = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ],
      attributes: ['id', 'text', 'createdAt'],
      order: [['createdAt', 'ASC']],
      raw: true,
      nest: true
    })
    io.emit('getPreviousMessages', previousMessages)

    // 建立訊息
    socket.on('createMessage', async (data) => {
      try {
        const query = await Message.create({
          text: data.text,
          UserId: data.id
        })
        // console.log(query.dataValues)
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
        console.log(newMessage)

        io.emit('getNewMessage', newMessage)
      } catch (err) {
        console.error(err)
      }
    })

    function updateOnlineUser() {
      io.emit('onlineUser', onlineUsers, { onlineCount: onlineUsers.length })
      console.log(onlineUsers)
    }
  })
}
