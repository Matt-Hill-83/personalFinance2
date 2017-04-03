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
    numPayments: {
      type     : DataTypes.BIGINT,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
    },

    isWeekly: {
      type        : DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isMonthly: {
      type        : DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dayOfWeek: {
      type     : DataTypes.BIGINT,
      allowNull: true
    },
    dayOfMonth: {
      type     : DataTypes.BIGINT,
      allowNull: true
    }
    

  }
  );

  return Comment;
};