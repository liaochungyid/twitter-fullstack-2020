module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'activeTime', {
      type: Sequelize.DATE,
      defaultValue: new Date()
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'activeTime')
  }
}
