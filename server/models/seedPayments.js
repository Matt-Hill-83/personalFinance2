'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('seedPayment', {
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
      type: DataTypes.DATE,
    },
  },
  {
    // underscored: true


  });
  return User;
};