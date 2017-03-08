var express = require('express');
var router = express.Router();
var models = require('../models/index');

const path = require('path');

router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'views', 'finance.html'));
});

// * @param  {Array<Object|Model>}       [options.include] A list of associations to eagerly load using a left join.
// Supported is either `{ include: [ Model1, Model2, ...]}` or `{ include: [{ model: Model1, as: 'Alias' }]}`.
// If your association are set up with an `as` (eg. `X.hasMany(Y, { as: 'Z }`, you need to specify Z in the
// as attribute when eager loading Y).

//    * @param  {Model}                     [options.include[].model] The model you want to eagerly load
//    * @param  {String}                    [options.include[].as] The alias of the relation, in case the model you want to eagerly load is aliassed. For `hasOne` / `belongsTo`, this should be the singular name, and for `hasMany`, it should be the plural
//    * @param  {Association}               [options.include[].association] The association you want to eagerly load. (This can be used instead of providing a model/as pair)
//    * @param  {Object}                    [options.include[].where] Where clauses to apply to the child models. Note that this converts the eager load to an inner join, unless you explicitly set `required: false`
//    * @param  {Array<String>}             [options.include[].attributes] A list of attributes to select from the child model
//    * @param  {Boolean}                   [options.include[].required] If true, converts to an inner join, which means that the parent model will only be loaded if it has any matching children. True if `include.where` is set, false otherwise.
//    * @param  {Array<Object|Model>}       [options.include[].include] Load further nested related models

router.get('/blocks', function(req, res) {
  models.blocks.findAll({
    include: [
      {
        model: models.seedDatas,
        include: [
          {
            model: models.seedDataJoinPayments,
            include: [
              {
                model: models.seedPayments
              }
            ],

          }
        ]
      }
    ]
  })
  .then(blocks => {
        res.json(blocks)
  });
});

router.post('/users', function(req, res) {
  models.User.create({
    email: req.body.email
  }).then(function(user) {
    res.json(user);
  });
});

// get all todos
router.get('/todos', function(req, res) {
  models.Todo.findAll({}).then(function(todos) {
    res.json(todos);
  });
});

// get single todo
router.get('/todo/:id', function(req, res) {
  models.Todo.find({
    where: {
      id: req.params.id
    }
  }).then(function(todo) {
    res.json(todo);
  });
});

// add new todo
router.post('/todos', function(req, res) {
  models.Todo.create({
    title: req.body.title,
    UserId: req.body.user_id
  }).then(function(todo) {
    res.json(todo);
  });
});

// update single todo
router.put('/todo/:id', function(req, res) {
  models.Todo.find({
    where: {
      id: req.params.id
    }
  }).then(function(todo) {
    if(todo){
      todo.updateAttributes({
        title: req.body.title,
        complete: req.body.complete
      }).then(function(todo) {
        res.send(todo);
      });
    }
  });
});

// delete a single todo
router.delete('/todo/:id', function(req, res) {
  models.Todo.destroy({
    where: {
      id: req.params.id
    }
  }).then(function(todo) {
    res.json(todo);
  });
});

module.exports = router;
