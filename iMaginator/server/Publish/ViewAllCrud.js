Meteor.publish('ViewAllCrud', function (collectionId, view) {
  var self = this;
  //try {
    var colSet = viewAllCrud(collectionId, view);
    self.added('viewAll', collectionId, colSet);
    self.ready();
  // } catch (e) {
  //   var err = {error: {location: 'ViewAllCrud', details: e}};
  //   console.log(EJSON.stringify(err, {indent: true}));
  // }

});

function viewAllCrud(collectionId){
  //try {
    //console.log({view: view});
    var colItem = IMAG.getCollection(collectionId);
    var data = IMAG.getData(colItem,null,'SA');
    //console.log(data);
    var defs = DataDefinition.find({collection: collectionId},{sort: {showInGrid: -1, gridOrder: 1}}).fetch();
    var view = IMAG.getView(collectionId,'VAC');
    var columns = [];
    var dataSet = [];
    var groups = [];
    var unfilteredGroups = [];
    var showGroups = false;
    if(view) if (view.groupBy) {
      groups.push('All');
      showGroups = true;
    }
    //build columns
    //edit
    //check for hidden fields
    var hasHidden = IMAG.hasHidden(defs);

    //console.log(hasHidden);
    if(hasHidden) {
      var colDetails = {className: 'details-control', name: 'details', autoWidth: true, orderable: false, width: '10px',
        defaultContent: '<i class="fa fa-plus-square-o table-icon closed">'};
      columns.push(colDetails);
    }
    var colEdit = {name: 'edit', autoWidth: true, orderable: false, width: '10px',
      defaultContent: '<button type="button" class="btn btn-info btn-xs" value="edit"><i class="fa fa-paste">&nbsp;Edit</button>'};
    columns.push(colEdit);
    var colKey = {name: 'key', orderable: false, data: 'key', visible: false};
    columns.push(colKey);
    var colHidden = {name: 'hidden', orderable: false, data: 'hidden', visible: false};
    columns.push(colHidden);
    _.each(defs, function(item){
      var col = {
        title: item.friendlyName,
        name: item.columnName,
        data: item.columnName,
        visible: item.showInGrid || false
      };
      if(item.dataType==='DRP'){
      item.lookupData = IMAG.getLookupData(
          item.lookupCollectionItem,
          item.lookupIdColumn,
          item.lookupDisplayColumn,
          ''
        );
      }
      //console.log(col);
      columns.push(col);
    });
    var colDelete = {name: 'delete', autoWidth: true, orderable: false, width: '10px',
      defaultContent: '<button type="button" class="btn btn-danger btn-xs" value="delete"><i class="fa fa-times">&nbsp;Delete</button>'};
    columns.push(colDelete);
    //dataSet
    //console.log(data);
    _.each(data, function(item){
      var dataItem = {
        key: "",
        hidden: []
      };
      if(hasHidden) {dataItem['details'] = 'details';}
      dataItem['edit'] = 'edit';
      _.each(defs, function(def){
        if(def.isPrimary === true) {
          if(dataItem.key==='') dataItem.key += def.columnName + "=" + item[def.columnName];
          else dataItem.key += '&' + def.columnName + "=" + item[def.columnName];
        }
        if (item[def.columnName]) if (item[def.columnName]['@nil']) item[def.columnName] = '';
        if (!item[def.columnName]) item[def.columnName] = '';
        if (!def.showInGrid) dataItem.hidden.push({label: def.friendlyName, value: item[def.columnName]});
        if (showGroups) if(def.columnName === view.groupBy && def.dataType != 'DRP') unfilteredGroups.push(item[def.columnName])
        if(def.dataType === 'BLN') {
          if(item[def.columnName]===true || item[def.columnName]===1) dataItem[def.columnName] = '<i class="fa fa-check"></i>';
          else dataItem[def.columnName] = '<i class="fa fa-times"></i>';
        }
        else if(def.dataType === 'ICN') dataItem[def.columnName] = '<i class="fa '+item[def.columnName]+'"></i>';
        else if(def.dataType==='DRP') {
          //console.log(item);
          if(item[def.columnName]) {
            //console.log(def);
            var temp = _.findWhere(def.lookupData, {id: item[def.columnName]});
            if(!temp) temp = _.findWhere(def.lookupData, {name: item[def.columnName]});
            if(!temp) {
              console.log(item);
              console.log(def.columnName);
              console.log(item[def.columnName]);
              console.log(def.lookupData);
            }
            dataItem[def.columnName] = temp.name;
            //console.log({col: def.columnName, gb: view.groupBy, nm: temp.name});
            if (showGroups) if(def.columnName === view.groupBy) unfilteredGroups.push(temp.name)
          } else {
            dataItem[def.columnName] = '...';
            if (showGroups) if(def.columnName === view.groupBy) unfilteredGroups.push('...');
          }
        }
        else dataItem[def.columnName] = item[def.columnName];
      });
      dataItem['delete'] = 'delete';
      //console.log(dataItem);
      dataSet.push(dataItem);
    });

    if(showGroups) {
      unfilteredGroups = _.uniq(unfilteredGroups,false);
      groups = _.union(groups, unfilteredGroups);
    }
    colSet = {
      name: collectionId,
      collection: colItem,
      showGroups: showGroups,
      groupColumn: view.groupBy,
      groups: groups,
      columns: columns,
      data: dataSet
    };
    //console.log({showGroups: showGroups, groups: groups});
    return colSet;
  // } catch (e) {
  //   var err = {error: {location: 'viewAllCrud', details: e}};
  //   console.log(EJSON.stringify(err, {indent: true}));
  // }
};
