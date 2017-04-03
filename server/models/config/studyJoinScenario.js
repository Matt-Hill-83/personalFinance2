'use strict'

module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('studyJoinScenario', {
    id: {
      type         : DataTypes.BIGINT,
      primaryKey   : true,
      autoIncrement: true,
      allowNull    : false,
    },
    studyId: {
      type: DataTypes.BIGINT,
      required: true
    },
    scenarioId: {
      type: DataTypes.BIGINT,
      required: true
    },

  });

  return Return;
};