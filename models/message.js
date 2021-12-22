module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      text: DataTypes.TEXT,
      UserId: DataTypes.INTEGER
    },
    {}
  )
  Message.associate = function (models) {
    Message.belongsTo(models.User)
  }
  return Message
}
