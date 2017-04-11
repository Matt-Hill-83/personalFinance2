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
    description: {
      type: DataTypes.TEXT,
    },
    user: {
      type: DataTypes.TEXT,
    },
    indexWithinParent: {
      type     : DataTypes.BIGINT,
      allowNull: true,
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