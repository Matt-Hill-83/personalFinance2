
// findById(id, [options]) -> Promise.<Instance>

'use strict';
var dropDataBase = true;
var dropDataBase = false;

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config.json')[env];
var db        = {};

if (config.use_env_variable) {
	console.log('using_env_variable');
	
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

// blocks
db.blocks               = require('../models/lineItemDefinitions/block.js')(sequelize, Sequelize);
db.tallys               = require('../models/lineItemDefinitions/tally.js')(sequelize, Sequelize);
db.seedDatas            = require('../models/lineItemDefinitions/seedData.js')(sequelize, Sequelize);
db.seedDataJoinPayments = require('../models/lineItemDefinitions/seedDataJoinPayment.js')(sequelize, Sequelize);
db.seedPayments         = require('../models/lineItemDefinitions/seedPayment.js')(sequelize, Sequelize);
db.tallyPayments        = require('../models/lineItemDefinitions/tallyPayment.js')(sequelize, Sequelize);

// rules
db.rules = require('../models/rules/rule.js')(sequelize, Sequelize);

// config
db.scenarios          = require('../models/config/scenario.js')(sequelize, Sequelize);
db.studys             = require('../models/config/study.js')(sequelize, Sequelize);
db.studyJoinScenarios = require('../models/config/studyJoinScenario.js')(sequelize, Sequelize);

// Files with seeds to create initial blocks in database:
db.getRuleSeeds    = require('../bin/ruleSeeds/rule.seeds.js');
db.getStudySeeds2  = require('../bin/householdStudy01.seeds.js');
db.getStudySeeds3  = require('../bin/study3.seeds.js');
db.getBasicSection = require('../bin/basicSection.seeds.js');

// Seed adding functions.
db.addSeeds = require('../bin/addSeedsToDataBase.js');

//Relations
db.tallys.belongsTo(db.tallyPayments);
db.blocks.hasOne   (db.tallys);

db.seedDataJoinPayments.belongsTo(db.seedPayments);
db.seedDatas           .hasOne   (db.seedDataJoinPayments);
db.blocks              .hasOne   (db.seedDatas);

// studys
db.studyJoinScenarios.belongsTo(db.scenarios);
db.studys            .hasMany  (db.studyJoinScenarios);

db.sequelize.sync({
 force: dropDataBase,
});

module.exports = db;

// // save this and use it to modify tables without dropping them.
// var tableToAlter = 'rules';

// db[tableToAlter].sync(
//   {
//     force: false,
//     alter: true,
//   })
// .then(resp=> {

// });

// Need to add this to model.js in sequelize file for alter to work.

/**
 * Sync this Model to the DB, that is create the table. Upon success, the callback will be called with the model instance (this)
 * @see {@link Sequelize#sync} for options
 * @return {Promise<this>}
 */


// Model.prototype.sync = function(options) {
//   options = _.extend({}, this.options, options);
//   options.hooks = options.hooks === undefined ? true : !!options.hooks;

//   const attributes = this.tableAttributes;

//   return Promise.try(() => {
//     if (options.hooks) {
//       return this.runHooks('beforeSync', options);
//     }
//   }).then(() => {
//     if (options.force) {
//       return this.drop(options);
//     }
//   })
//   .then(() => this.QueryInterface.createTable(this.getTableName(options), attributes, options, this))
//   .then(() => {
//     if(options.alter) {
//       return this.QueryInterface.describeTable(this.getTableName(options))
//         .then((columns) => {
//           var self = this;
//           var changes = []; // array of promises to run
//           _.each(attributes, function(columnDesc, columnName) {
//             if(!columns[columnName]) {
//               changes.push(() => self.QueryInterface.addColumn(self.getTableName(options), columnName, attributes[columnName]));
//             }
//           });
//           _.each(columns, function(columnDesc, columnName) {
//             if(!attributes[columnName]) {
//               changes.push(() => self.QueryInterface.removeColumn(self.getTableName(options), columnName, options));
//             } else {
//               if(!attributes[columnName].primaryKey) {
//                 changes.push(() => self.QueryInterface.changeColumn(self.getTableName(options), columnName, attributes[columnName]));
//               }
//             }
//           });
//           return changes.reduce((p, fn) => p.then(fn), Promise.resolve());
//         });
//       }
//   })
//   .then(() => this.QueryInterface.showIndex(this.getTableName(options), options))
//   .then(indexes => {
//     // Assign an auto-generated name to indexes which are not named by the user
//     this.options.indexes = this.QueryInterface.nameIndexes(this.options.indexes, this.tableName);

//     indexes = _.filter(this.options.indexes, (item1) => (
//       !_.some(indexes, item2 => item1.name === item2.name)
//     )).sort((index1, index2) => {
//       if (this.sequelize.options.dialect === 'postgres') {
//         // move concurrent indexes to the bottom to avoid weird deadlocks
//         if (index1.concurrently === true) return 1;
//         if (index2.concurrently === true) return -1;
//       }

//       return 0;
//     });

//     return Promise.map(indexes, index => this.QueryInterface.addIndex(
//       this.getTableName(options),
//       _.assign({
//         logging: options.logging,
//         benchmark: options.benchmark,
//         transaction: options.transaction
//       }, index),
//       this.tableName
//     ));
//   }).then(() => {
//     if (options.hooks) {
//       return this.runHooks('afterSync', options);
//     }
//   }).return(this);
// }

