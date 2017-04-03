'use strict'

module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('blocks', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    scenario: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    parentGuid: {
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
    type: {
      type: DataTypes.TEXT,
    },
    subtype1: {
      type: DataTypes.TEXT,
    },
    ruleAlias: {
      type: DataTypes.TEXT,
    },
    collapsed: {
      type        : DataTypes.BOOLEAN,
      defaultValue: false,
    },
    showRow: {
      type        : DataTypes.BOOLEAN,
      defaultValue: true,
    },

  });

  return Return;
};