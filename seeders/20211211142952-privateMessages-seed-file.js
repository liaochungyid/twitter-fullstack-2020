'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'PrivateMessages',
      Array.from({ length: 25 }).map((d, index) => ({
        id: index * 10 + 1,
        senderId: (index % 4) * 10 + 11, // 11, 21, 31, 41
        receiverId: (index % 4) * 10 + 21, // 21, 31, 41, 51
        text: faker.lorem.sentences().substring(0, 30),
        createdAt: new Date(new Date() - Math.floor(Math.random() * 86400)),
        updatedAt: new Date()
      })),
      Array.from({ length: 25 }).map((d, index) => ({
        id: index * 10 + 1,
        senderId: 51 - (index % 4) * 10, // 51, 41, 31, 21
        receiverId: 41 - (index % 4) * 10, // 41, 31, 21, 11
        text: faker.lorem.sentences().substring(0, 30),
        createdAt: new Date(new Date() - Math.floor(Math.random() * 86400)),
        updatedAt: new Date()
      }))
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PrivateMessages', null, {})
  }
}
