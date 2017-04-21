var express = require('express');
var router  = express.Router();
var models  = require('../models/index');

var cookieParser = require('cookie-parser');

require('./block.routes.js')(router);
require('./study.routes.js')(router);

const path = require('path');

router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'views', 'finance.html'));
});

//////////////////////////////// Blocks ////////////////////////////////////////////

// get blocks for scenario
router.get('/blocks/:scenarioId', (req, res)=>
  getBlocksWithChildrenForScenario(req.params.scenarioId)
  .then(blocks => {res.json(blocks)})
);

function getBlocksWithChildrenForScenario(scenarioId) {
  return models.blocks.findAll({
    where: {
      scenario: parseInt(scenarioId)
    },
    include: [
      {
        model  : models.tallys,
        include: [{model: models.tallyPayments}],
      },
      {
        model  : models.seedDatas,
        include: [
          {
            model  : models.seedDataJoinPayments,
            include: [{model: models.seedPayments}],
          }
        ]
      },
    ]
  });
}

router.post('/addRow', function(req, res) {
  models.addSeeds.createBlock(models, req.body.data)
  .then(blocks => {
    res.json(blocks)
  });
});

router.post('/addSection', function(req, res) {
  return models.addSeeds.createSection(models, req.body.data)
  .then(section => {
    res.json(section)
  });
});

// update single block
router.put('/blocks', function(req, res) {
  if (req.body.blockChanged) {
    var blockParams = {
      name             : req.body.data.name,
      indexWithinParent: req.body.data.indexWithinParent,
    };

    models.blocks.find({
      where: {
        id: req.body.data.id,
      }})
    .then(function(block) {
      if(block){
        // TODO: this is a security risk.  I should list out the parameters that can be updated.
        block.updateAttributes(blockParams)
        .then(function(block) {
          res.send(block);
        });
      }
    });
  }

  if (req.body.seedDataChanged && req.body.data.seedData) {
    var seedDataParams = {
      numDaysInInterval: req.body.data.seedData.numDaysInInterval,
      seedDataType     : req.body.data.seedData.seedDataType,
    };
    
    models.seedDatas.find({
      where: {
        id: req.body.data.seedData.id
      }
    }).then(function(seedData) {
      if(seedData){
        seedData.updateAttributes(seedDataParams)
        .then(function(seedData) {
          // res.send(seedData);
        });
      }
    });
  }

  if (
      req.body.initialPaymentChanged &&
      req.body.data.seedData &&
      req.body.data.seedData.initialPayment
    ) {
    var initialPaymentParams = {
      amount: req.body.data.seedData.initialPayment.amount,
      date  : req.body.data.seedData.initialPayment.date,
    };
    models.seedPayments.find({
      where: {
        id: req.body.data.seedData.initialPayment.id
      }
    }).then(function(seedPayment) {
      if(seedPayment){
        seedPayment.updateAttributes(initialPaymentParams)
        .then(function(seedPayment) {
          // res.send(seedPayment);
        });
      }
    });
  }
});

// delete a single block and all dependencies.
router.delete('/blocks/:id', (req, res)=> router.blockRoutes.destroyBlockWithChildren(req.params.id, res));

////////////////////// Scenarios /////////////////////////////////////////////

router.get('/scenarios', function(req, res) {
  models.scenarios.findAll({
  })
  .then(scenarios => {
    res.json(scenarios)
  });
});

router.post('/scenario', function(req, res) {
  models.addSeeds.createScenario(models, req.body.data)
  .then(function(resp) {
    res.json(resp)
  });
});

router.delete('/scenario/:id', function(req, res) {
  router.studyRoutes.destroyStudyJoinScenariosByScenarioId(req.params.id)
  .then(()=> {
    router.studyRoutes.destroyScenario(req.params.id)
  })
  .then(function(resp) {res.json(resp) });
});

////////////////////// Studys /////////////////////////////////////////////

// delete a single study and all dependencies.
router.delete('/studys/:id', (req, res)=> router.studyRoutes.destroyStudyWithChildren(req.params.id, res));

// get studys
router.get('/studys', function(req, res) {
  cookieParser.JSONCookie(req.headers.cookie);
  var userGuid = req.cookies.userGuid;
  
  console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
  console.log('userGuid: ');
  console.log(userGuid);
  console.log('|------------------------------------------------------------------------------------------------|')


  if (userGuid) {
    // If there is a userGuid (which is just the cookie), only get studys that were created using that userGuid.
    models.studys.findAll({
      where: {
        user: userGuid
      },
      include: [
        {
          model  : models.studyJoinScenarios,
          include: {model: models.scenarios},
        },
        {
          model: models.charts,
        },
      ]
    })
    .then(blocks => {
      res.json(blocks)
    });

  } else {
    // Safari doesn't have a cookie, so do not require the userGuid.
    models.studys.findAll({
      where: {
        // user: userGuid
      },
      include: [
        {
          model  : models.studyJoinScenarios,
          include: {model: models.scenarios},
        },
        {
          model: models.charts,
        },
      ]
    })
    .then(blocks => {
      res.json(blocks)
    });
  }
  
});

router.get('/newStudy/:guid', function(req, res) {
  cookieParser.JSONCookie(req.headers.cookie);
  var userGuid = req.cookies.userGuid;

  // Select which study you want here.
  var studyId = 0;
  var studyId = 2; // tally test
  var studyId = 1; // big one

  var studyGuid = req.params.guid;
  var params = {
    studyId : req.params.guid,
    userGuid: userGuid,
    };

  models.addSeeds.createStudyFromSeedData(models, params)
  .then(resp => {
    res.json(resp)
  });
});

// update single study
router.put('/study', function(req, res) {
  var studyParams = {
    name             : req.body.name,
    user             : req.body.user,
    indexWithinParent: req.body.indexWithinParent,
  };

  models.studys.find({
    where: {
      id: req.body.id,
    }})
  .then(function(study) {
    if(study){
      study.updateAttributes(studyParams)
      .then(function(study) {
        res.send(study);
      });
    }
  });
});


//////////////////////////////// Charts ////////////////////////////////////////////

router.get('/charts', function(req, res) {
  models.charts.findAll({
  })
  .then(charts => {
    res.json(charts)
  });
});

// update single chart
router.put('/chart', function(req, res) {
  var chartParams = {
    name             : req.body.data.name,
    indexWithinParent: req.body.data.indexWithinParent,
    lineItemGuids    : req.body.data.lineItemGuids,
    subTitle         : req.body.data.subTitle,
  };

  models.charts.find({
    where: {
      id: req.body.data.guid,
    }})
  .then(function(chart) {
    if(chart){
      chart.updateAttributes(chartParams)
      .then(function(chart) {
        res.send(chart);
      });
    }
  });
});

router.post('/charts', function(req, res) {
  var chart   = req.body.data;
  var studyId = req.body.data.studyGuid;
  
  models.createChart(chart, studyId)
  .then(function(chart) {
    res.json(chart);
  });
});

models.createChart = function(chart, studyId) {
  var newchart = {
    name             : chart.name,
    indexWithinParent: chart.indexWithinParent,
    lineItemGuids    : chart.lineItemGuids,
    subTitle         : chart.subTitle,
    studyId          : studyId,
  };

  return models.charts.create(newchart);
}

router.delete('/chart/:id', function(req, res) {
  models.charts.destroy({
    where: {
      id: req.params.id
    }
  }).then(function(chart) {
    res.json(chart);
  });
});

//////////////////////////////// Rules ////////////////////////////////////////////

router.get('/rules', function(req, res) {
  models.rules.findAll({
  })
  .then(rules => {
    res.json(rules)
  });
});

// update single rule
router.put('/rule', function(req, res) {
  var ruleParams = {
    name               : req.body.data.name,
    indexWithinParent  : req.body.data.indexWithinParent,

    sourceGuid         : req.body.data.sourceGuid,
    destinationGuid    : req.body.data.destinationGuid,
    outflowLineItemGuid: req.body.data.outflowLineItemGuid,
    inflowLineItemGuid : req.body.data.inflowLineItemGuid,

    destinationMaxAmount: req.body.data.destinationMaxAmount,
    sourceMinAmount     : req.body.data.sourceMinAmount,
  };

  models.rules.find({
    where: {
      id: req.body.data.guid,
    }})
  .then(function(rule) {
    if(rule){
      rule.updateAttributes(ruleParams)
      .then(function(rule) {
        res.send(rule);
      });
    }
  });
});

router.post('/rules', function(req, res) {
  var newRule = {
    name                : req.body.name,
    description         : req.body.description,
    indexWithinParent   : req.body.indexWithinParent,
    scenario            : req.body.scenario,
    function            : req.body.function,
    sourceGuid          : req.body.sourceGuid,
    sourceMinAmount     : req.body.sourceMinAmount,
    outflowLineItemGuid : req.body.outflowLineItemGuid,
    destinationGuid     : req.body.destinationGuid,
    inflowLineItemGuid  : req.body.inflowLineItemGuid,
    destinationMaxAmount: req.body.destinationMaxAmount,
  };

  models.rules.create(newRule)
  .then(function(rule) {
    res.json(rule);
  });
});

router.delete('/rule/:id', function(req, res) {
  models.rules.destroy({
    where: {
      id: req.params.id
    }
  }).then(function(rule) {
    res.json(rule);
  });
});

////////////////////// Tables /////////////////////////////////////////////

// delete all data.
router.delete('/tables', function(req, res) {
  models.sequelize.sync({
   force: true,
  }).then(function(resp) {
    res.json('dropped');
  });
});

////////////////////////////////////////////////

// crap saved from demo
function oldStuff() {
  // This container just lets me fold the code.
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
}

module.exports = router;
