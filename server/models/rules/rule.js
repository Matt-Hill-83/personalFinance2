'use strict'

module.exports = (sequelize, DataTypes) => {
  const Rule = sequelize.define('rules', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    name: {
      type     : DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type     : DataTypes.TEXT,
      allowNull: true,
    },
    indexWithinParent: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    scenario: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    function: {
      type     : DataTypes.TEXT,
      allowNull: true,
    },

    sourceGuid: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    sourceMinAmount: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    outflowLineItemGuid: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },

    destinationGuid: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    inflowLineItemGuid: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    destinationMaxAmount: {
      type     : DataTypes.DOUBLE,
      allowNull: true,
    },

  });

  return Rule;
};