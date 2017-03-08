functions = {
	seedDataBase,

};

function seedDataBase(db){
  var topBlock = db.getBlockSeeds()[0];
  topBlock.guid = 0;
  createBlock(db, topBlock);
}

var nestLevel = -1;
function createBlock(db, block){
  nestLevel += 1;
  
  block.children.forEach(child=> {
    // create child
    return db.blocks.create({
      id        : null,
      name      : child.name,
      title     : child.title,
      type      : child.type,
      nestLevel : nestLevel,
      parentGuid: block.guid,
    })
    .then(function(createdObj) {
      child.guid = createdObj.id;
      if (createdObj.type === 'lineItem') {
        createSeedData(db, child, createdObj);
      } else if (child.type === 'section') {
        createBlock(db, child);
      }

    });
  })
}

// return db.blocks.findAll({where: {id: parent.id}})
function createSeedData(db, block, parent) {
  var blockId       = 0;
  var seedPaymentId = 0;
  var seedDataId    = 0;

  var blockId = parent.id;
  
  // create seed data
  return db.seedDatas.create({
    id               : null,
    blockId          : blockId,
    seedDataType     : block.seedData.seedDataType,
    numDaysInInterval: block.seedData.numDaysInInterval,
  })

  // create payment
  .then(function(parent) {
  	// Only create a payment if one is defined.
		if (block.seedData.initialPayment) {
	    seedDataId = parent.id;
	    
	    var date;
	    if (block.seedData.initialPayment.date) {
	      date = new Date(block.seedData.initialPayment.date);
	    }

	    return db.seedPayments.create({
	      id    : null,
	      amount: block.seedData.initialPayment.amount,
	      date  : date,
	    })

	    // create seedDataJoinPayment
	    .then(function(parent) {
	      seedPaymentId = parent.id;
	      return db.seedDataJoinPayments.create({
	        id           : null,
	        seedDataId   : parseInt(seedDataId),
	        seedPaymentId: parseInt(seedPaymentId),
	      });
	    });
		}
  });
}

module.exports = functions;
