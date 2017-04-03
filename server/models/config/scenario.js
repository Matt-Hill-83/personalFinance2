'use strict'

module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('scenario', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    name: {
      type: DataTypes.TEXT,
    },
    user: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },

  });

  return Return;
};