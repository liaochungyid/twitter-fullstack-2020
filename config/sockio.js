const db = require('./../models')
const { Message, User } = db

module.exports = (io) => {
  io.on('connection', async (socket) => {
    let user

    // 使用者上線
    // socket.on('connectUser', async (id) => {
    //   data = await User.findByPk(id, { attributes: ['id', 'name', 'avatar'], raw: true })
    //   console.log('onlineUser', user)
    //   // io.emit('notify', data)
    // })

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
          UserId: data.UserId,
          text: data.text
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
        console.log('newMessage', newMessage)

        io.emit('getNewMessage', newMessage)
      } catch (err) {
        console.error(err)
      }
    })
  })
}
