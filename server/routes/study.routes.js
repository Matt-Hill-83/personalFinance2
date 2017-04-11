module.exports = function(router){
  var models = require('../models/index');

  router.studyRoutes = {
    destroyStudyJoinScenariosByScenarioId,
    destroyStudyWithChildren,
    destroyStudyJoinScenarios,
    destroyScenario,
  };

  function destroyStudyWithChildren(id, res) {
    return getStudyWithChildren(id)
    .then((resp)=> {
      if (!resp[0] || !resp[0].dataValues) {
        return;
      }

      var study                 = resp[0].dataValues;
      var studyId               = study.id;
      var studyJoinScenarios    = study.studyJoinScenarios;
      var studyJoinScenariosIds = studyJoinScenarios.map(s=>s.dataValues.id);
      var scenarioIds           = study.studyJoinScenarios.map(join=> join.dataValues.scenarioId);

      console.log('studyId: ');
      console.log(studyId);
      console.log('studyJoinScenariosIds: ');
      console.log(studyJoinScenariosIds);
      console.log('scenarioIds: ');
      console.log(scenarioIds);

      var promises         = studyJoinScenariosIds.map(joinId=> destroyStudyJoinScenarios(joinId));
      var combinedPromises = models.sequelize.Promise.all(promises);

      return combinedPromises.then(resp=>{
        var promises = scenarioIds.map(id=> destroyScenario(id));
        var combinedPromises = models.sequelize.Promise.all(promises);
        return combinedPromises.then(resp=> destroyStudy(studyId));
      });
    })

    // Move this to parent.
    .then(studys => {
      res.json(studys)
    });
  }

  function getStudyWithChildren(studyId) {
    return models.studys.findAll({
      where: {
        id: parseInt(studyId)
      },
      include: [
        {
          model  : models.studyJoinScenarios,
        }
      ]
    });
  }

  function destroyStudy(studyId) {
    return models.studys.destroy(
      {
        where: {id: parseInt(studyId)}
      }
    );
  }

  function destroyStudyJoinScenarios(id) {
    return models.studyJoinScenarios.destroy(
      {
        where: {id: parseInt(id)}
      }
    );
  }

  function destroyStudyJoinScenariosByScenarioId(scenarioId) {
    return models.studyJoinScenarios.destroy(
      {
        where: {scenarioId: parseInt(scenarioId)}
      }
    );
  }

  function destroyScenario(scenarioId) {
    return models.scenarios.destroy(
      {
        where: {id: parseInt(scenarioId)}
      }
    );
  }

};