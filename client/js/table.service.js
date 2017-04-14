"use strict"
angular.module('app').factory('Table', [
  'DataGeneration',
  '$rootScope',
  'DataBase',
  'Constants',
  'Utilities',
  Main_]);

function Main_(
  DataGeneration,
  $rootScope,
  DataBase,
  Constants,
  Utilities
  ) {
  var baseNestLevel = 2;
  var nestOffsetEm  = 2;
  var collapsed = {
    false        : '▼',
    reversedFalse: '▲', // for upward folding rows
    true         : '▶',
    // false: '▲',
    // true : '◀',
  };

  var service = {
    collapseSection,
    expandSection,
    redrawTable,
  };

  return service;

  //////////////////////// Table Operations ////////////////////////////////////////////////////////

  function redrawTable(scenarioGuid) {
    var tableConfig = Constants.tableConfig;

    //When redrawing, empty out the array while still preserving the reference to it.
    Constants.scenarios[scenarioGuid].tableMatrix.splice(0, Constants.scenarios[scenarioGuid].tableMatrix.length);
    var newTable = [];
    
    // Add a row to contain the Scenario title.
    var titleRow     = _createBlankRow(tableConfig.numColInTable + 1);
    titleRow.type    = 'titleRow';
    titleRow.classes = ['title-row'];
    titleRow.data    = {
      numColInTable: tableConfig.numColInTable - 0,
    };
    titleRow.cells.forEach(cell=> cell.classes = ['title-row']);

    newTable.push(titleRow);
    newTable.push(..._createTableHeaderRows(scenarioGuid, tableConfig.numColInTable, tableConfig.startDate));
    newTable.push(..._createSections(Constants.scenarios[scenarioGuid].topSection, tableConfig));

    newTable = addFormatingToTable(newTable);

    // Collapse sections if required in init data.
    collapseSections(newTable);

    // Finish altering table before you push it to the template.
    Constants.scenarios[scenarioGuid].tableMatrix.push(...newTable);

    // Send notification that table has been rebuilt.
    $rootScope.$broadcast('tableRebuilt', {scenarioGuid: scenarioGuid});
  }

  function addFormatingToTable(newTable) {
    // add a blank column to hold settings buttons
    newTable.forEach(row=> {
      var blankCell = {
        classes: [],
      };
      blankCell.classes.push(...row.cells[0].classes); 
      blankCell.classes.push(...['header-buttons']); 
      row.cells.splice(1, 0, blankCell);
    });

    // Set type of cells in 2nd column to blank if cell in first column has a type of blank.
    newTable.forEach((row, index)=> {
      if (row.cells[0].type === 'blank') {
        row.cells[1].type = 'blank';
      }
    });

    if (Constants.tableSettings.tableInterval === 'weekly') {
      _applyRightBorderToTransitionCells(newTable);
    }

    if (Constants.tableSettings.tableInterval === 'monthly') {
      _applyRightBorderToTransitionCells(newTable);
    }

    // format the right most table cells.
    newTable.forEach(row=> {
      var cell = Utilities.getLast(row.cells);
      Utilities.addClasses(cell, ['table-right']);
    });

    // format the left most table cells.
    newTable.forEach((row, index)=> {
      if (index > 1) {
        var cell = row.cells[0];
        Utilities.addClasses(cell, ['table-left']);
      }
    });

    // format the bottom most table cells.
    var lastRow = Utilities.getLast(newTable);
    lastRow.cells.forEach((cell, index)=> {
      if (index >= 0) {
        Utilities.addClasses(cell, ['table-bottom']);
      }
    });
    // format the top of the first row of table cells.
    var firstDataRow = newTable[1];
    firstDataRow.cells.forEach((cell, index)=> {
      if (index > 1) {
        Utilities.addClasses(cell, ['table-bottom']);
      }
    });

    // format specific cells
    newTable[0].cells[0].classes = ['top-left'];
    newTable[1].cells[1].classes = ['cell-1-1'];
    newTable[1].cells[1].type    = 'blank';

    return newTable;
  }

  function collapseSections(table) {
    DataBase.lineItems.getSections().filter(section=> section.collapsed).forEach(section=> collapseSection(section));
  }

  function collapseSection(section) {
    if (!section.cells) {
      return;
    }

    var children = DataBase.lineItems.getChildBlocksFromSection(section);
    children.forEach(child=> {
      child.rowVisible = false;
    });

    section.collapsed = true;
  }

  function expandSection(section) {
    DataBase.lineItems.getChildBlocksFromSection(section).forEach(block=> {
      block.rowVisible = true;
      block.collapsed  = false;
    });

    section.collapsed = false;
  }

  ////////////////////////  Sections  /////////////////////////////////////////////

  function _createTableHeaderRows(scenarioGuid, numColInTable, startDate) {
    var isMonthly = true;
    var isWeekly  = false;
    var isYearly  = false;                  

    var dateCells  = [];
    var monthCells = [];
    var yearCells  = [];

    var weekdays      = Utilities.weekdays;
    var months        = Utilities.monthsLower;
    var previousMonth = '';
    var previousYear  = '';
    
    Utilities.clearArray(Constants.tableConfig.monthTransitionCells);
    Utilities.clearArray(Constants.tableConfig.yearTransitionCells);
    // Add blank cell for (0,0)
    dateCells.push({classes:  ['blank'], type: 'blank'});
    monthCells.push({classes: ['blank'], type: 'blank'});
    yearCells.push({classes:  ['blank'], type: 'blank'});

    // Create an object for each date and prepopulate it with properties.
    Constants.tableConfig.dates.forEach((newDate, index)=>{
      var dayOfMonth = Utilities.padNumber(newDate.getDate());
      var curMonth   = months[newDate.getMonth()].slice(0,3);
      var dayString  = weekdays[newDate.getDay()].slice(0,3);
      
      var dateString  = dayOfMonth;
      // var monthString = curMonth;
      var year        = newDate.getFullYear();
      var yearString  = year.toString();
      var monthString = curMonth + '-' + yearString.slice(2, 4);

      // Record the index of the cells which transition from one month to the next.
      if (monthString !== previousMonth) {
        Constants.tableConfig.monthTransitionCells.push(index);
      }
      previousMonth = monthString;

      // Record the index of the cells which transition from one month to the next.
      if (year !== previousYear) {
        Constants.tableConfig.yearTransitionCells.push(index);
      }
      
      previousYear = year;

      var date = {
        valueToDisplay : dateString,
        classes        : ['date-cell'],
      };

      var month = {
        valueToDisplay : monthString,
        classes        : ['month-cell'],
      };

      var year = {
        valueToDisplay : year,
        classes        : ['year-cell'],
      };

      if (Constants.tableSettings.tableInterval === 'weekly') {
        date.classes.push(monthString.toLowerCase());
        // month.classes.push(monthString.toLowerCase());
      }

      if (Constants.tableSettings.tableInterval === 'monthly') {
        month.classes.push('year' + newDate.getFullYear()%2); // Color even and odd years differently.
      }

      dateCells.push(date);
      monthCells.push(month);
      yearCells.push(year);
    });

    // Account for the blank column we will insert.
    Constants.tableConfig.yearTransitionCells = Constants.tableConfig.yearTransitionCells.map(value=> value += 1);

    var dateRow = {
      classes   : ['blank-background'],
      cells     : dateCells,
      rowVisible: true,
      type      : 'colHeader',
    };

    var monthRow = {
      classes   : ['blank-background'],
      cells     : monthCells,
      rowVisible: true,
      type      : 'colHeader',
    };

    var yearRow = {
      classes   : ['blank-background'],
      cells     : yearCells,
      rowVisible: true,
      type      : 'colHeader',
    };

    var rows = [
      // yearRow,
      monthRow,
      // dateRow,
    ];

    return rows;
  }

  function _createSections(block, tableConfig) {
    var table    = [];
    var children = DataBase.lineItems.getFirstChildrenOf(block);

    children.forEach((block) => {
      if (block.type === 'section') {
        var tableSection = _createSections(block, tableConfig);
        if (block.tally) {
          tableSection.push(_createRowFromLineItem(tableConfig, block));
        } else {
          tableSection = _addTotalsRowsToSection(tableSection, block, tableConfig);
        }
        table.push(...tableSection);

        // Create blank row after tally sections only.
        if (block.tally) {
          table.push(_createBlankRow(table[0].cells.length));
        }
      } else if (block.type === 'lineItem') {
        table.push(_createRowFromLineItem(tableConfig, block));
      }
    });

    return table;
  }

  function _addTotalsRowsToSection(tableRows, section, tableConfig) {
    var sectionRows = [];
    if (section.nestLevel <= baseNestLevel) {
      sectionRows.push(...tableRows);
      sectionRows.push(_createRowFromLineItem(tableConfig, section));
    } else {
      sectionRows.push(_createRowFromLineItem(tableConfig, section));
      sectionRows.push(...tableRows);
    }

    return sectionRows;
  }

  ////////////////////////  Rows  /////////////////////////////////////////////

  function _createBlankRow(rowLength) {
    var cells = [];

    for (var i = 0; i < rowLength; i++) {
      var blankCell = {
        valueToDisplay: '0',
        classes       : ['blank'],
        type          : 'blank',
      };

      cells.push(blankCell);
    }

    return {
      rowVisible: true,
      classes   : ['blank'],
      type      : 'blank',
      cells     : cells
    };
  }

  function _createRowFromLineItem(tableConfig, block) {
    var payments = [];
    var payment;

    // Add line item name to first column.
    var firstCell = {
      valueToDisplay: block.name,
      classes       : ['rowHeader' + (block.nestLevel - nestOffsetEm)],
      type          : block.type,
    };

    if (block.type === 'section' && block.subtype1 === 'total of tallies') {
      Utilities.addClasses(block, ['total-of-tallies']);
    }

    if (block.tally) {
      firstCell.valueToDisplay = block.name + ' BUCKET';
    }

    payments.push(firstCell);

    // Grab a slice of the db, so you don't need to look through the entire db every iteration.
    var dbSliceParams = {
      parentGuid: block.guid,
    };

    var dbSliceParams = {
      parentGuid: block.guid,
    };

    var params = {
    };

    // Tally lineItems will have 2 payments for each date, a total, and a tally.
    // Specify that you need the tally payment.
    if (block.tally) {
      params.type = 'tally';
    }
    var dbSlice = DataBase.payments.getByParams(dbSliceParams);
    
    tableConfig.dates.forEach(date=>{
      var defaultPayment = {
        classes       : ['cell'],
        valueToDisplay: 0,
        amount        : 0
      };

      params.date = date;

      var match = DataBase.payments.getByParams(params, dbSlice)[0];
      if (match) {
        payment = match;
        payment.valueToDisplay = parseInt(payment.amount.toFixed(0));
      } else {
        payment = defaultPayment;
      }

      payments.push(payment);
    });

    if (block.tally) {
      payments.forEach(payment=> {
        payment.classes.push('tally');
      });
      Utilities.addClasses(block, ['tally']);
    }

    var newParams = {
      rowVisible: true,
      cells     : payments,
    };

    angular.extend(block, newParams);

    return block;
  }

  ////////////////////////  Cells  /////////////////////////////////////////////

  function _applyRightBorderToTransitionCells(table) {
    table.forEach(row=> {
      row.cells.forEach((cell, index)=> {
        if (Constants.tableConfig.yearTransitionCells.indexOf(index) !== -1){
          if (cell.classes) {
            cell.classes.push('right-border');
          } else {
            cell.classes = ['right-border'];
          }
        };
      });
    });
  }

}
  


























