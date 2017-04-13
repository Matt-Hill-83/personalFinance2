functions = {
	createLineItemDefinition,
	createStudyFromSeedData,
	createSection,
	createBlock,
	createScenario,
};

function getBlockIdFromRuleAlias(ruleSeedData, ruleAlias, scenario) {
	var results = ruleSeedData.filter(rule=> {
		return (
			rule.scenario  === scenario &&
			rule.ruleAlias === ruleAlias
		);
	});

	if (results.length !== 1) {
		return 'error: no rule alias found!';
	} else {
		return results[0];
	}
}

// Creates study, scenario, and all blocks, from template file.
function createStudyFromSeedData(db, params) {
	var studyId     = params.studyId;
	var userGuid    = params.userGuid;
	db.ruleSeedData = [];

	var studys = [
		{}, // we don't use index 0
		db.getGradSchoolSeeds(),	
		db.getStudySeeds2(),	
		db.getStudySeeds3(),	
	];

	var study = studys[studyId];
	var studyToReturn = {};

  return db.studys.create(
  	{
			name       : study.name,
			description: study.description,
			user       : userGuid,
    }
  ).then((newStudy)=> {
  	studyToReturn = newStudy;
		var studyId  = newStudy.id;

  	// Create chart objects.
  	// I'm ignoring the promises for now.
  	if (study.charts && study.charts.length > 0) {
  		var indexWithinParent = 0;
  		// return if study.charts is a string
  		if (study.charts.forEach) {
				study.charts.forEach(chart=> {
					chart.indexWithinParent = indexWithinParent;
					db.createChart(chart, studyId);
					indexWithinParent += 1;
				});
  		}
    }

		var promises = study.scenarios.map(scenarioObj=> {
			scenarioObj.studyGuid = studyId;
			scenarioObj.user      = userGuid;
  		return createScenario(db, scenarioObj)
  		.then(scenario=> {
				var block        = scenarioObj.block;
				block.scenario   = scenario.id;
				block.parentGuid = -1;

  			return createBlock(db, block)
  			.then((newBlock)=> {
			  	if (scenarioObj.ruleSeeds) {

				  	scenarioObj.ruleSeeds.forEach((rule, index)=> {
							var sourceGuid          = getBlockIdFromRuleAlias(db.ruleSeedData, rule.sourceGuid, scenario.id).blockId;
							var destinationGuid     = getBlockIdFromRuleAlias(db.ruleSeedData, rule.destinationGuid, scenario.id).blockId;
							var outflowLineItemGuid = getBlockIdFromRuleAlias(db.ruleSeedData, rule.outflowLineItemGuid, scenario.id).blockId;
							var inflowLineItemGuid  = getBlockIdFromRuleAlias(db.ruleSeedData, rule.inflowLineItemGuid, scenario.id).blockId;

						  var newRule = {
						    name                : rule.name,
						    indexWithinParent   : index,
						    scenario            : scenario.id,
						    function            : rule.function,

						    sourceGuid          : sourceGuid,
						    destinationGuid     : destinationGuid,
						    outflowLineItemGuid : outflowLineItemGuid,
						    inflowLineItemGuid  : inflowLineItemGuid,
						    
						    sourceMinAmount     : rule.sourceMinAmount,
						    destinationMaxAmount: rule.destinationMaxAmount,
						  };
						  db.rules.create(newRule);		  		
				  	});
			  		
			  	} else {
			  		return newBlock;
			  	}

  			});
  		})
  	});
		return db.sequelize.Promise.all(promises);

  })
  .then(()=> {
  	return studyToReturn;
  });
}

// Creates sections and lineItems recursively.
// Can be used with json from seed files, or to create blocks based on input data from client.
// When the data is from client, there is no .children.
function createBlock(db, block){
	var indexWithinParent = block.indexWithinParent ? block.indexWithinParent : 0; // for the top level block
  
  return db.blocks.create({
		collapsed        : block.collapsed,
		scenario         : block.scenario,
		name             : block.name,
		ruleAlias        : block.ruleAlias,
		type             : block.type,
		subtype1         : block.subtype1,
		parentGuid       : block.parentGuid,
		indexWithinParent: indexWithinParent,
  })
  .then(function(newBlock) {
		block.id = newBlock.id;

  	// Find rule aliases that will be used to create rules from seed data.
  	if (block.ruleAlias && db.ruleSeedData) {
  		db.ruleSeedData.push(
				{
					scenario : block.scenario,
					blockId  : newBlock.id,
					ruleAlias: block.ruleAlias,
				}	
			);
  	}

  	if (block.type === 'lineItem' && block.seedData) {
  		block.id = newBlock.id;
      return createLineItemDefinition(db, block);
    }
    else if (block.type === 'section' && block.tally) {
	    return db.tallyPayments.create({
	      amount: block.tally.tallyPayment.amount,
	      date  : block.tally.tallyPayment.date,
	    })
	    .then(function(createdPayment) {
			  return db.tallys.create({
					blockId            : newBlock.id,
					type               : 'tally',
					annualEscalationPct: block.tally.annualEscalationPct,
					tallyPaymentId     : createdPayment.id
			  })
			  .then(()=> newBlock);
	    });
  	} else {
      return db.sequelize.Promise.resolve(newBlock);
  	}
  })
  .then(function(newBlock) {
  	if (block.children) {
			var indexWithinParent = 0;  
			var promises = block.children.map(child=> {
		  	indexWithinParent += 1;
	      child.indexWithinParent = indexWithinParent;

				child.scenario   = block.scenario;
				child.parentGuid = newBlock.id;

        return createBlock(db, child);
	    });
		  return db.sequelize.Promise.all(promises);
  	} else {
      return db.sequelize.Promise.resolve(newBlock);
  	}

  });
}

// Create a lineItem
function createLineItemDefinition(db, block) {
	var seedPaymentId = 0;
	var seedDataId    = 0;
	var blockId       = block.id;
  
  // create seed data
	var seedPromise = db.seedDatas.create({
    id               : null,
    blockId          : blockId,
    seedDataType     : block.seedData.seedDataType,
    numDaysInInterval: block.seedData.numDaysInInterval,
    numPayments      : block.seedData.numPayments,
  })

  // create payment
  .then(function(newSeedData) {
  	// Only create a payment if one is defined.
		if (block.seedData.initialPayment) {
	    seedDataId = newSeedData.id;
	    
	    var date;
	    if (block.seedData.initialPayment.date) {
	    }

	    return db.seedPayments.create({
	      id    : null,
	      amount: block.seedData.initialPayment.amount,
	      date  : block.seedData.initialPayment.date,
	    })
	    // create seedDataJoinPayment
	    .then(function(newPayment) {
	      seedPaymentId = newPayment.id;
	      return db.seedDataJoinPayments.create({
	        id           : null,
	        seedDataId   : parseInt(seedDataId),
	        seedPaymentId: parseInt(seedPaymentId),
	      });
	    });
		}
  });
  
  return seedPromise;
}

////////////////////////// helpers //////////////////////////////////////////

function addStudyJoinScenariosToDb(db, studyId, scenarioId) {
  var resp = db.studyJoinScenarios.create(
  	{
			studyId,
			scenarioId,
    }
  );
  return resp;
}

// Creates a scenario and joins is to section.
// This should be split into 2 functions.
function createScenario(db, scenarioObj={name: 'new scenario'}) {
 	var name =  scenarioObj.name ? scenarioObj.name : 'new scenario';
 	var createdScenario;
  return db.scenarios.create(
  	{
			name: scenarioObj.name,
    }
  ).then(resp=> {
  	createdScenario = resp;
  	return addStudyJoinScenariosToDb(db, scenarioObj.studyGuid, resp.id)
  	.then(resp=> {return createdScenario})
  })
}

// Insert a new blank section, from template in file.
function createSection(db, data) {
	var newSection               = db.getBasicSection();
	newSection.scenario          = data.scenario;
	newSection.parentGuid        = data.parentGuid;
	newSection.indexWithinParent = data.indexWithinParent;

	return createBlock(db, newSection);
}

module.exports = functions;
