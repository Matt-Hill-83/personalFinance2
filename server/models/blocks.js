'use strict'

module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('blocks', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    nestLevel: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    parentGuid: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    name: {
      type: DataTypes.TEXT,
      required: true
    },
    type: {
      type: DataTypes.TEXT,
      required: true
    },
    title: {
      type: DataTypes.TEXT,
      required: true
    },
    collapsed: {
      type        : DataTypes.BOOLEAN,
      defaultValue: false,
    },
    showRow: {
      type        : DataTypes.BOOLEAN,
      defaultValue: true,
    },

  },
  {
    // underscored: true
  });

  return Return;
};