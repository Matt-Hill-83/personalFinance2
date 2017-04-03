module.exports = function(router){
  var models = require('../models/index');

  router.blockRoutes = {
    destroyBlockWithChildren
  };

  function destroyBlockWithChildren(id, res) {
    return getBlockWithChildren(id)
    .then((resp)=> {
      console.log('resp: ');
      console.log(resp);

      var block   = resp[0].dataValues;
      var blockId = block.id;
      console.log('blockId: ');
      console.log(blockId);

      var hasSeedData = block.seedData;
      if (hasSeedData) {
        var seedData = block.seedData.dataValues;
        console.log('seedData: ');
        console.log(seedData);

        var seedDataId = seedData.id;
        console.log('seedDataId: ');
        console.log(seedDataId);

        var hasSeedDataJoinPayment = seedData.seedDataJoinPayment;

        if (seedDataJoinPayment) {
          var seedDataJoinPayment   = seedData.seedDataJoinPayment.dataValues;
          var seedDataJoinPaymentId = seedDataJoinPayment.id;
          console.log('seedDataJoinPaymentId: ');
          console.log(seedDataJoinPaymentId);

          var seedPaymentId = seedDataJoinPayment.seedPaymentId;
          console.log('seedPaymentId: ');
          console.log(seedPaymentId);
        }

        if (seedDataJoinPayment) {
          return     destroySeedDataJoinPayment(seedDataJoinPaymentId)
          .then(()=> destroySeedPayment(seedPaymentId))
          .then(()=> destroySeedData(seedDataId))
          .then(()=> destroyBlock(blockId));
        }

        // For blocks without seedDataJoinPayments and SeedPayments:
        if (!seedDataJoinPayment) {
          return destroySeedData(seedDataId)
          .then(()=> destroyBlock(blockId));
        }
      } else {
        destroyBlock(blockId);
      }

    })

    // Move this to parent.
    .then(blocks => {
      res.json(blocks)
    });

  }

  function getBlockWithChildren(blockId) {
    return models.blocks.findAll({
      where: {
        id: parseInt(blockId)
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

  function destroyBlock(blockId) {
    return models.blocks.destroy(
      {
        where: {id: parseInt(blockId)}
      }
    );
  }

  function destroySeedDataJoinPayment(seedDataJoinPaymentId) {
    return models.seedDataJoinPayments.destroy(
      {
        where: {id: parseInt(seedDataJoinPaymentId)}
      }
    );
  }

  function destroySeedPayment(seedPaymentId) {
    return models.seedPayments.destroy(
      {
        where: {id: parseInt(seedPaymentId)}
      }
    );
  }

  function destroySeedData(seedDataId) {
    return models.seedDatas.destroy(
      {
        where: {id: parseInt(seedDataId)}
      }
    );
  }

}