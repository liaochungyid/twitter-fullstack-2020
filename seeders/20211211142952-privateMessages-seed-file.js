'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PrivateMessages', [
      {
        id: 11,
        senderId: 11,
        receiverId: 21,
        text: '11, User1 to User2:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 1),
        updatedAt: new Date()
      },
      {
        id: 21,
        senderId: 21,
        receiverId: 11,
        text: '21, User2 to User1:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 2),
        updatedAt: new Date()
      },
      {
        id: 31,
        senderId: 11,
        receiverId: 21,
        text: '31, User1 to User2:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 3),
        updatedAt: new Date()
      },
      {
        id: 41,
        senderId: 11,
        receiverId: 31,
        text: '41! User1 to User3:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 4),
        updatedAt: new Date()
      },
      {
        id: 51,
        senderId: 31,
        receiverId: 11,
        text: '51! User3 to User1:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 5),
        updatedAt: new Date()
      },
      {
        id: 61,
        senderId: 11,
        receiverId: 31,
        text: '61! User1 to User3:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 6),
        updatedAt: new Date()
      },
      {
        id: 71,
        senderId: 11,
        receiverId: 21,
        text: '71! User1 to User2:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 7),
        updatedAt: new Date()
      },
      {
        id: 81,
        senderId: 11,
        receiverId: 21,
        text: '81! User1 to User2:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 8),
        updatedAt: new Date()
      },
      {
        id: 91,
        senderId: 21,
        receiverId: 11,
        text: '91! User2 to User1:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 9),
        updatedAt: new Date()
      },
      {
        id: 101,
        senderId: 21,
        receiverId: 11,
        text: '101! User2 to User1:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 10),
        updatedAt: new Date()
      },
      {
        id: 111,
        senderId: 51,
        receiverId: 11,
        text: '111! User5 to User1:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 11),
        updatedAt: new Date()
      },
      {
        id: 121,
        senderId: 21,
        receiverId: 31,
        text: '121! User2 to User3:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 12),
        updatedAt: new Date()
      },
      {
        id: 131,
        senderId: 11,
        receiverId: 51,
        text: '131! User1 to User5:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 13),
        updatedAt: new Date()
      },
      {
        id: 141,
        senderId: 11,
        receiverId: 51,
        text: '141! User1 to User5:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 14),
        updatedAt: new Date()
      },
      {
        id: 151,
        senderId: 51,
        receiverId: 11,
        text: '151! User5 to User1:' + faker.lorem.text().substring(0, 10),
        unread: false,
        createdAt: new Date(new Date() - 86400000 + 1000000 * 15),
        updatedAt: new Date()
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PrivateMessages', null, {})
  }
}
