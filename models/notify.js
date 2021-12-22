module.exports = (sequelize, DataTypes) => {
  const notify = sequelize.define(
    'Notify',
    {
      observerId: DataTypes.INTEGER,
      observedId: DataTypes.INTEGER
    },
    {}
  )
  notify.associate = function (models) {}
  return notify
}
