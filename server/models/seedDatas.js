'use strict'

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('seedDatas', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    blockId: {
      type     : DataTypes.BIGINT,
      allowNull: true
    },
    seedDataType: {
      type    : DataTypes.TEXT,
      required: true
    },
    numDaysInInterval: {
      type     : DataTypes.BIGINT,
      allowNull: true
    },
  },
  {
    // underscored: true
  });

  return Comment;
};