'use strict'

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('seedDataJoinPayment', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    seedDataId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    seedPaymentId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
  },
  {
    // underscored: true
  });

  return Comment;
};
