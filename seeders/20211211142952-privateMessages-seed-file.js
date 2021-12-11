'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PrivateMessages', [
      {
        id: 11,
        senderId: 11,
        receiverId: 21,
        text: 'User1 to User2',
        unread: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 21,
        senderId: 21,
        receiverId: 11,
        text: 'User2 to User1',
        unread: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 31,
        senderId: 11,
        receiverId: 21,
        text: 'User1 to User2',
        unread: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 41,
        senderId: 11,
        receiverId: 31,
        text: 'User1 to User3',
        unread: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PrivateMessages', null, {})
  }
}
