'use strict'

module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('charts', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    studyId: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    indexWithinParent: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    name: {
      type: DataTypes.TEXT,
    },
    lineItemGuids: {
      type: DataTypes.TEXT,
    }

  });

  return Return;
};