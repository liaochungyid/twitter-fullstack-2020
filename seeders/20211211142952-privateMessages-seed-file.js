'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PrivateMessages', [
      {
        id: 11,
        senderId: 11,
        receiverId: 21,
        text: 'User1 to User2',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 1),
        updatedAt: new Date()
      },
      {
        id: 21,
        senderId: 21,
        receiverId: 11,
        text: 'User2 to User1',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 2),
        updatedAt: new Date()
      },
      {
        id: 31,
        senderId: 11,
        receiverId: 21,
        text: 'User1 to User2',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 3),
        updatedAt: new Date()
      },
      {
        id: 41,
        senderId: 11,
        receiverId: 31,
        text: 'User1 to User3',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 4),
        updatedAt: new Date()
      },
      {
        id: 51,
        senderId: 31,
        receiverId: 11,
        text: 'User3 to User1',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 5),
        updatedAt: new Date()
      },
      {
        id: 61,
        senderId: 11,
        receiverId: 31,
        text: 'User1 to User3',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 6),
        updatedAt: new Date()
      },
      {
        id: 71,
        senderId: 11,
        receiverId: 21,
        text: 'User1 to User2',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 7),
        updatedAt: new Date()
      },
      {
        id: 81,
        senderId: 11,
        receiverId: 21,
        text: 'User1 to User2',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 8),
        updatedAt: new Date()
      },
      {
        id: 91,
        senderId: 21,
        receiverId: 11,
        text: 'User2 to User1',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 9),
        updatedAt: new Date()
      },
      {
        id: 101,
        senderId: 21,
        receiverId: 11,
        text: 'User2 to User1',
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 10),
        updatedAt: new Date()
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PrivateMessages', null, {})
  }
}
