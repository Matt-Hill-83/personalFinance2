'use strict'

module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('tallys', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    blockId: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    tallyPaymentId: {
      type     : DataTypes.BIGINT,
      allowNull: true,
    },
    name: {
      type: DataTypes.TEXT,
    },
    annualEscalationPct: {
      type: DataTypes.DOUBLE,
    },
    type: {
      type: DataTypes.TEXT,
    },
    title: {
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