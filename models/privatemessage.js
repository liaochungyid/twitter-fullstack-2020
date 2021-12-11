'use strict'
module.exports = (sequelize, DataTypes) => {
  const PrivateMessage = sequelize.define(
    'PrivateMessage',
    {
      senderId: DataTypes.INTEGER,
      receiverId: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      unread: { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {}
  )
  PrivateMessage.associate = function (models) {
    // associations can be defined here
  }
  return PrivateMessage
}
