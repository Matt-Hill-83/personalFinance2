angular.module('app')
  .directive('ruleManager', [ruleManagerController]);

function ruleManagerController() {
  return {
    scoperestrict    : 'E',
    templateUrl : 'views/rules.template.html',
    controller  : [
    	'Api',
    	'Constants',
    	'Utilities',
    	'DataBase',
    	'$scope',
    	RuleManagerCtrl
  	],
    controllerAs: 'ruleManager',
  };
}

function RuleManagerCtrl(
	Api,
	Constants,
	Utilities,
	DataBase,
	$scope
	) {
	var vm     = this;
	var parent = $scope.maintable;

	vm.parentParams;
	vm.showPicker    = showPicker;
	vm.addRule       = addRule;
	vm.deleteRule    = deleteRule;
	vm.updateRule    = updateRule;
	vm.lineItemNames = parent.tableMatrix;
	
	init();

  //////////////////////
  

  function updateRule(rule) {
  	return Api.updateRule({data: rule})
  	.then(()=> {
  		if (isRuleValid(rule)){
	  		parent.fetchRulesAndRedrawTable();
  		}

  	}).then(init);
  }

  function isRuleValid(rule) {
  	// Don't do an expensive table refresh if all the rule fields are not selected.
		return (
			DataBase.lineItems.getBlockFromGuid(rule.sourceGuid).guid &&
			DataBase.lineItems.getBlockFromGuid(rule.outflowLineItemGuid).guid &&
			DataBase.lineItems.getBlockFromGuid(rule.destinationGuid).guid &&
			DataBase.lineItems.getBlockFromGuid(rule.inflowLineItemGuid).guid
		);
  }

  function deleteRule(rule) {
  	Api.deleteRule(rule.guid)
  	.then(()=> {
  		parent.fetchRulesAndRedrawTable()
  		.then(init);
	  });
  }

  function addRule(rule) {
  	var indexWithinParent;
  	if(rule && rule.guid) {
  		indexWithinParent = rule.indexWithinParent + 1;
  	} else {
  		indexWithinParent = 0;
  	}

  	var newRule = {
			"name"                : "new rule",
			"description"         : null,
			"indexWithinParent"   : indexWithinParent,
			"scenario"            : parent.scenarioGuid,
			"function"            : "moveUntilFull",
			"sourceGuid"          : -1,
			"sourceMinAmount"     : 0,
			"outflowLineItemGuid" : -1,
			"destinationGuid"     : -1,
			"inflowLineItemGuid"  : -1,
			"destinationMaxAmount": 10000
		};

	  vm.rules.forEach(rule=> {
	    if (rule.indexWithinParent >= newRule.indexWithinParent) {
	      rule.indexWithinParent += 1;
	      updateRule(rule);
	    }
	  });

  	vm.rules.push(newRule);
  	vm.rules = Utilities.sortSections(vm.rules);
	  init();

  	Api.addRule(newRule)
  	.then(()=> {
  		parent.fetchRules()
  		.then(init);
  	});
  }

  // Gets called from the parent directive when a new row is selected in the parent template.
  function sourceGuidCallBack(rowGuid) {
    this.sourceGuid = rowGuid;
  	updateRule(this);
  }

  function destinationGuidCallBack(rowGuid) {
    this.destinationGuid = rowGuid;
  	updateRule(this);
  }

  function inflowLineItemGuidCallBack(rowGuid) {
    this.inflowLineItemGuid = rowGuid;
  	updateRule(this);
  }

  function outflowLineItemGuidCallBack(rowGuid) {
    this.outflowLineItemGuid = rowGuid;
  	updateRule(this);
  }

	function init() {
		vm.rules = Constants.rules.filter(rule=> rule.scenario === parent.scenarioGuid);
		vm.rules.forEach(rule=> {
			rule.sourceGuidName          = DataBase.lineItems.getBlockFromGuid(rule.sourceGuid).name || 'click to select';
			rule.outflowLineItemGuidName = DataBase.lineItems.getBlockFromGuid(rule.outflowLineItemGuid).name || 'click to select';
			rule.destinationGuidName     = DataBase.lineItems.getBlockFromGuid(rule.destinationGuid).name || 'click to select';
			rule.inflowLineItemGuidName  = DataBase.lineItems.getBlockFromGuid(rule.inflowLineItemGuid).name || 'click to select';

			rule.sourceGuidCallBack          = sourceGuidCallBack;
			rule.destinationGuidCallBack     = destinationGuidCallBack;
			rule.inflowLineItemGuidCallBack  = inflowLineItemGuidCallBack;
			rule.outflowLineItemGuidCallBack = outflowLineItemGuidCallBack;
		});

		if (vm.rules.length === 0) {
			// If the table is empty, push a fake rule to the table so that the 'add' button shows up.
			var fakeRule = {fakeRule: true};
			vm.rules.push(fakeRule);
		}

	}

	function showPicker(rule, callBack) {
		rule.callBack  = callBack;
		parent.oldRule = rule;
		parent.showPicker();
	}

}
