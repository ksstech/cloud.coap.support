Meteor.publish('DetailAllSmartChild', function (collectionId, filter, filterFunction, filterGroup) {
  var self = this;
  //try {
    //console.log({function:'DetailAllSmartChild',collectionId: collectionId,filter: filter, filterFunction:filterFunction,filterGroup:filterGroup});
    var colItem = IMAG.getCollection(collectionId);

    var data = IMAG.getData(colItem,filter,filterFunction, true, filterGroup);

    var view = IMAG.getView(collectionId,'VDSC');

    var defs = IMAG.getDataDefinition(collectionId);
    var disps = ViewColumn.find({collection: collectionId, view: view._id}, {sort:{order:1}}).fetch();
    var columns = [];
    var dataSet = [];
    var groups = [];
    var unfilteredGroups = [];
    var showGroups = false;
    if(view) if (view.groupBy) {
      groups.push('All');
      showGroups = true;
    }
    //console.log(view);
    //if(!view.canEdit) view.canEdit = true;
    if(view.canEdit===true) {
      var colEdit = {name: 'edit', autoWidth: true, orderable: false, width: '10px',
        defaultContent: '<button type="button" class="btn btn-primary btn-xs tbl-button" data-toggle="modal" data-backdrop="static" data-target="#smartEditModal" value="edit"><i class="fa fa-paste"></button>'};
      columns.push(colEdit);
    }
    var colKey = {name: 'key', orderable: false, data: 'key', visible: false};
    columns.push(colKey);
    _.each(disps, function(disp){
      var col = {
        title: defs[disp.column]['friendlyName'],
        name: disp.column,
        data: disp.column,
        visible: true
      };
      if(defs[disp.column].dataType==='DRP'){
      defs[disp.column].lookupData = IMAG.getLookupData(
          defs[disp.column].lookupCollectionItem,
          defs[disp.column].lookupIdColumn,
          defs[disp.column].lookupDisplayColumn,
          ''
        );
      }
      //console.log(col);
      columns.push(col);
    });
    var colDelete = {name: 'delete', autoWidth: true, orderable: false, width: '10px',
      defaultContent: '<button type="button" class="btn btn-danger btn-xs tbl-button" value="delete"><i class="fa fa-times"></button>'};
    columns.push(colDelete);

    //dataSet
    //console.log(data);
    _.each(data, function(item){
      var dataItem = {
        key: {}
      };
      if (view.canEdit===true) dataItem['edit'] = 'edit';
      _.each(disps, function(disp){
        if(defs[disp.column].isPrimary === true) dataItem.key[disp.column] = item[disp.column];
        if (item[disp.column]) if (item[disp.column]['@nil']) item[disp.column] = '';
        if (!item[disp.column]) item[disp.column] = '';
        if (showGroups) if(defs[disp.column].columnName === view.groupBy && defs[disp.column].dataType != 'DRP') unfilteredGroups.push(item[defs[disp.column].columnName])
        if(defs[disp.column].dataType === 'BLN') {
          if(item[disp.column]===true || item[disp.column]==='1') dataItem[disp.column] = '<i class="fa fa-check"></i>';
          else dataItem[disp.column] = '<i class="fa fa-times"></i>';
        }
        else if(defs[disp.column].dataType === 'ICN') dataItem[disp.column] = '<i class="fa '+item[disp.column]+'"></i>';
        else if(defs[disp.column].dataType==='DRP') {
          //console.log(item);
          if(item[disp.column]) {
            //console.log(def);
            var temp = _.findWhere(defs[disp.column].lookupData, {id: item[disp.column]});
            if(!temp) temp = _.findWhere(defs[disp.column].lookupData, {name: item[disp.column]});
            if(!temp) {
              console.log(item);
              console.log(disp.column);
              console.log(item[disp.column]);
              console.log(defs[disp.column].lookupData);
            }
            dataItem[disp.column] = temp.name;
            if (showGroups) if(defs[disp.column].columnName === view.groupBy) unfilteredGroups.push(temp.name)
            //console.log({col: def.columnName, gb: view.groupBy, nm: temp.name});
          } else {
            dataItem[disp.column] = '...';
            if (showGroups) if(defs[disp.column].columnName === view.groupBy) unfilteredGroups.push('...');
          }
        }
        else dataItem[disp.column] = item[disp.column];
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
    //console.log(colSet);
    self.added('detailAllSmartChild', collectionId, colSet);
    self.ready();
  // } catch (e) {
  //   var err = {error: {location: 'ViewAllCrud', details: e}};
  //   console.log(EJSON.stringify(err, {indent: true}));
  // }

});
