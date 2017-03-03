"use strict"
angular.module('app').factory('Table', ['DataGeneration', 'DataBase', 'Constants', 'Utilities', Main_]);

function Main_(DataGeneration, DataBase, Constants, Utilities) {
  var nestOffsetEm = 2;
  var collapsed    = {
    true : '[+]',
    false: '[-]',
  }

  var service = {
    collapseSection,
    expandSection,
    redrawTable: redrawTable,
    tableMatrix: [],
  };

  return service;

  //////////////////////// Table Operations ////////////////////////////////////////////////////////

  function redrawTable(tableConfig) {
    DataBase.rebuildLocalDataBase();

    //When redrawing, empty out the array while still preserving the reference to it.
    service.tableMatrix.splice(0, service.tableMatrix.length);
    service.tableMatrix.push(..._createTableHeaderRows(tableConfig.numColInTable, tableConfig.startDate));
    service.tableMatrix.push(..._createSections(Constants.tableConfig.topSection, tableConfig));

    _applyRightBorderToTransitionCells(service.tableMatrix);

    // Collapse sections if required in init data.
    collapseSections();
  }

  function collapseSections() {
    DataBase.lineItems.getSections().filter(section=> section.collapsed).forEach(section=> collapseSection(section));
  }

  function collapseSection(section) {
    section.cells[0].expander = collapsed.true;
    DataBase.lineItems.getChildBlocksFromSection(section).forEach(block=> {
      block.rowVisible = false;
      if (block.type === 'section') {
        block.cells[0].expander = collapsed.true;
      }
        
    });

    // Unhide the lineItem itself.
    section.rowVisible = true;
    section.collapsed  = true;
  }

  function expandSection(section) {
    section.cells[0].expander = collapsed.false;
    DataBase.lineItems.getChildBlocksFromSection(section).forEach(block=> {
      if (block.type === 'section') {
        block.cells[0].expander = collapsed.false;
      }
        
      block.rowVisible = true;
      block.collapsed  = false;
    });

    section.collapsed = false;
  }

  ////////////////////////  Sections  /////////////////////////////////////////////

  function _createTableHeaderRows(numColInTable, startDate) {
    var dateCells  = [];
    var monthCells = [];
    var yearCells  = [];

    var weekdays      = Utilities.weekdays;
    var months        = Utilities.months;
    var previousMonth = '';
    var previousYear  = '';
    
    Utilities.clearArray(Constants.monthTransitionCells);
    Utilities.clearArray(Constants.yearTransitionCells);
    // Add blank cell for (0,0)
    dateCells.push({classes:  ['blank']});
    monthCells.push({classes: ['blank']});
    yearCells.push({classes:  ['blank']});

    // Create an object for each date and prepopulate it with properties.
    Constants.tableConfig.dates.forEach((newDate, index)=>{
      var dayOfMonth  = Utilities.padNumber(newDate.getDate());
      var curMonth    = months[newDate.getMonth()].slice(0,3);
      var dayString   = weekdays[newDate.getDay()].slice(0,3);
      
      var dateString  = dayOfMonth;
      var monthString = curMonth;
      var yearString  = newDate.getFullYear();

      // Record the index of the cells which transition from one month to the next.
      if (monthString !== previousMonth) {
        Constants.tableConfig.monthTransitionCells.push(index);
      }
      previousMonth = monthString;

      // Record the index of the cells which transition from one month to the next.
      if (yearString !== previousYear) {
        Constants.tableConfig.yearTransitionCells.push(index);
      }
      previousYear = yearString;

      var date = {
        valueToDisplay : dateString,
        classes        : ['date-cell', monthString.toLowerCase()],
      };

      var month = {
        valueToDisplay : monthString,
        classes        : ['month-cell', monthString.toLowerCase()],
      };

      var year = {
        valueToDisplay : yearString,
        classes        : ['year-cell', 'year' + newDate.getFullYear()%2], // Color even and odd years differently.
      };

      dateCells.push(date);
      monthCells.push(month);
      yearCells.push(year);
    });

    var dateRow = {
      classes   : ['date-row'],
      cells     : dateCells,
      rowVisible: true,
      type      : 'colHeader',
    };

    var monthRow = {
      classes   : ['month-row'],
      cells     : monthCells,
      rowVisible: true,
      type      : 'colHeader',
    };

    var yearRow = {
      classes   : ['year-row'],
      cells     : yearCells,
      rowVisible: true,
      type      : 'colHeader',
    };

    var rows = [
      yearRow,
      monthRow,
      dateRow,
    ];

    return rows;
  }

  function _createSections(block, tableConfig) {
    var table = [];
    var children = DataBase.lineItems.getFirstChildrenOf(block);

    children.forEach((block) => {
      if (block.type === 'section') {
        var tableSection = _createSections(block, tableConfig);
        tableSection     = _addTotalsRowsToSection(tableSection, block, tableConfig);
        if (block.tally) {
          tableSection.push(_createTallyRow(block, tableConfig));
        }
        table.push(...tableSection);

        // Create blank row after top level sections only.
        // This should really detect the first level with actual blocks.
        if (block.nestLevel === 1) {
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
    if (
      section.nestLevel === 1 
      ) {
      sectionRows.push(...tableRows);
      sectionRows.push(_createTotalsRow(section, tableConfig));
    } else {
      sectionRows.push(_createTotalsRow(section, tableConfig));
      sectionRows.push(...tableRows);
    }

    return sectionRows;
  }

  ////////////////////////  Rows  /////////////////////////////////////////////

  function _createTotalsRow(section, tableConfig) {
    var payments = [];

    var title = section.nestLevel === 1 ? section.title : section.title;
    var firstCell =
      {
        expander      : section.collapsed ? collapsed.true : collapsed.false,
        valueToDisplay: title,
        classes       : ['rowHeader' + (section.nestLevel - nestOffsetEm), 'header', 'section-total'],
        type          : 'section',
      };

    // Add cell header to row.
    payments.push(firstCell);

    var params = {
      parentGuid: section.guid,
      type      : 'total gross',
    };

    // Populate Totals row from paymentDb.
    tableConfig.dates.forEach(date=>{
      params.date = date;
      payments.push(DataBase.payments.getByParams(params)[0]);
    });

    var classes = [];
    classes.push('section-total-level-' + section.nestLevel);

    var newParams = {
      rowVisible: true,
      cells     : payments,
      classes   : classes,
    };

    angular.extend(section, newParams);

    return section;
  }  

  function _createBlankRow(rowLength) {
    var blankCell = {
      valueToDisplay: '0',
      classes       : ['blank'],
    };

    return {
      rowVisible: true,
      type      : 'blank',
      cells     : Utilities.initArray(rowLength, blankCell)
    };
  }

  function _createRowFromLineItem(tableConfig, lineItem) {
    var payments = tableConfig.dates.map(date=>{
      var defaultPayment = {
        valueToDisplay: 0,
      };

      var params = {
        date: date,
        parentGuid: lineItem.guid,
      };

      var match = DataBase.payments.getByParams(params)[0];
      return match ? match : defaultPayment;
    });

    // Add line item name to first column.
    var nameObject = {
      valueToDisplay: lineItem.title,
      classes       : ['rowHeader' + (lineItem.nestLevel - nestOffsetEm)],
      type          : lineItem.type,
    };

    payments.unshift(nameObject);

    var newParams = {
      rowVisible: true,
      classes   : ['line-item'],
      cells     : payments
    };

    angular.extend(lineItem, newParams);

    return lineItem;
  }

  ////////////////////////  Cells  /////////////////////////////////////////////

  function _applyRightBorderToTransitionCells(table) {
    table.forEach(row=> {
      
      row.cells.forEach((cell, index)=> {
        if (Constants.tableConfig.monthTransitionCells.indexOf(index) !== -1){
          if (cell.classes) {
            cell.classes.push('right-border');
          } else {
            cell.classes = ['right-border'];
          }
        };
      });
    });
  }

  ////////////////////////  Irregular Rows  /////////////////////////////////////////////

  function _createTallyRow(block, tableConfig) {
    var newRow        = [];
    var tallyPayments = [];

    block.classes.push(...['rowHeader' + (block.nestLevel - nestOffsetEm), 'header', 'tally']);

    var rowHeader = {
      valueToDisplay: block.title + ' tally',
      classes       : block.classes,
    };

    newRow.push(rowHeader);

    var params = {
      parentGuid: block.guid,
      type      : 'tally',
    };

    tableConfig.dates.forEach(date=>{
      params.date = date;
      var payment = DataBase.payments.getByParams(params)[0];
      // TODO: move rounding to template.
      payment.valueToDisplay = payment.amount.toFixed(0);
      tallyPayments.push(payment);
    });
    
    newRow.push(...tallyPayments);

    var newParams = {
      rowVisible: true,
      cells     : newRow
    };

    var newBlock = angular.copy(block);
    angular.extend(newBlock, newParams);
    return newBlock;    
  }

}
  


























