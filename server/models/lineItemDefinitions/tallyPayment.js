'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('tallyPayment', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    amount: {
      type: DataTypes.DOUBLE,
      required: true
    },
    date: {
      type: DataTypes.TEXT,
      // type: DataTypes.DATE,
    },
  });
  return User;
};