const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // random serial user id
    const userList = []
    for (let i = 0; i < 50; i++) {
      userList.push(Math.floor(Math.random() * 5) * 10 + 11)
    }

    await queryInterface.bulkInsert(
      'chats',
      userList.map((UserId, index) => ({
        id: index * 10 + 1,
        text: faker.lorem.sentences().substring(0, 140),
        UserId,
        createdAt: new Date(
          new Date().setDate(new Date().getDate() - 50 + index)
        ),
        updatedAt: new Date(
          new Date().setDate(new Date().getDate() - 50 + index)
        )
      })),
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('chats', null, {})
  }
}
