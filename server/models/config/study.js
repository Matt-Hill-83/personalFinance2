'use strict'

module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('study', {
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

  },
  {
    name: {
      singular: 'study',
      plural  : 'studys',
    },
    tableName: 'studys'
  }    
  );

  return Return;
};