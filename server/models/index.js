'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config.json')[env];
var db        = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//Models/tables
db.blocks               = require('../models/blocks.js')(sequelize, Sequelize);
db.seedDatas            = require('../models/seedDatas.js')(sequelize, Sequelize);
db.seedDataJoinPayments = require('../models/seedDataJoinPayments.js')(sequelize, Sequelize);
db.seedPayments         = require('../models/seedPayments.js')(sequelize, Sequelize);

//Relations
db.seedDataJoinPayments.belongsTo(db.seedPayments);
db.seedPayments        .hasOne   (db.seedDataJoinPayments);

db.seedDataJoinPayments.belongsTo(db.seedDatas);
db.seedDatas           .hasOne   (db.seedDataJoinPayments);

db.seedDatas.belongsTo(db.blocks);
db.blocks   .hasOne   (db.seedDatas);

db.getBlockSeeds = require('../bin/cashSeeds.js');
db.addSeeds      = require('../bin/addSeedsToDataBase.js');

// var dropDataBase = true;
var dropDataBase = false;

var seedDataBase = true;
// var seedDataBase = false;

db.sequelize.sync({ force: dropDataBase })
.then(resp=> {
  if (seedDataBase) {
    db.addSeeds.seedDataBase(db);
  }
});

module.exports = db;
