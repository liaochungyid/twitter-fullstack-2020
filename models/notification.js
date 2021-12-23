module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      observerId: DataTypes.INTEGER,
      observedId: DataTypes.INTEGER
    },
    {}
  )
  Notification.associate = function (models) {}
  return Notification
}
