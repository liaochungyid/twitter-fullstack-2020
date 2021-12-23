module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      senderId: DataTypes.INTEGER,
      receiverId: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      unread: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    {}
  )
  Message.associate = function (models) {
    // associations can be defined here
  }
  return Message
}
