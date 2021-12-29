module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      observerId: DataTypes.INTEGER,
      observedId: DataTypes.INTEGER
    },
    {}
  )
  Notification.associate = function (models) {
    Notification.belongsTo(models.User, {
      through: models.Notification,
      foreignKey: 'observedId',
      as: 'subed'
    })
    Notification.belongsTo(models.User, {
      through: models.Notification,
      foreignKey: 'observerId',
      as: 'suber'
    })
  }
  return Notification
}
