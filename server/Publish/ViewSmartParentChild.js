Meteor.publish('ViewSmartParentChild', function (collectionId, view) {
  var self = this;
  //todo:
  //datatables without headers, paging, internal search. use external search. tabls according to view group
  //columns according to view columns.
  //view columns can have icons
  //details button that will lead to editing
  //right side will have multiple entries for child data
  //try {
    var colItem = IMAG.getCollection(collectionId);
    var view = IMAG.getView(collectionId,'VASPC');
    var data = IMAG.getData(colItem,null,'SASP');
    var defs = IMAG.getDataDefinition(collectionId);
    var smartView = SmartViewSettings.find({view: view._id}).fetch();
    smartView = smartView[0];
    var disp = ViewColumn.find({collection: collectionId, view: view._id}, {sort:{order:1}}).fetch();
    //console.log(smartView);
    var columns = [];
    var dataSet = [];
    var groups = [];
    var unfilteredGroups = [];
    var showGroups = false;

    colItem.description = view.description;
    if(view) if (view.groupBy) {
      groups.push('All');
      showGroups = true;
    }

    var colKey = {name: 'key', orderable: false, data: 'key', visible: false};
    columns.push(colKey);
    //console.log(disp);
    if(smartView.parentEdit===true) {
      var colDetail = {name: 'edit', autoWidth: true, orderable: false, width: '10px',
        defaultContent: '<button type="button" class="btn btn-primary btn-xs tbl-button" data-toggle="modal" data-backdrop="static" data-target="#smartEditModal" value="edit"><i class="fa fa-paste"></button>'};
      columns.push(colDetail);
    }
    columns.push({data: 'header', name: 'header', orderable: false, visible: false});
    _.each(disp, function(item){
      def = defs[item.column];
      var col = { title: def.friendlyName, name: def.columnName, data: def.columnName, autoWidth: true};
      if(def.columnName === view.groupBy || def.isPrimary) col.visible = false;
      else col.visible = true;
      //col.visible = def.isPrimary ? false : true;
      columns.push(col);
    });
    if(smartView.parentDetail===true) {
      var colDetail = {name: 'detail', autoWidth: true, orderable: false, width: '10px',
        defaultContent: '<button type="button" class="btn btn-info btn-xs" value="detail"><i class="fa fa-eye">&nbsp;Detail</button>'};
      columns.push(colDetail);
    }
    if(smartView.parentDelete===true) {
      var colDetail = {name: 'delete', autoWidth: true, orderable: false, width: '10px',
        defaultContent: '<button type="button" class="btn btn-danger btn-xs tbl-button" value="delete"><i class="fa fa-times"></button>'};
      columns.push(colDetail);
    }

    _.each(data, function(item){
      var dataItem = {
        key: {},
      };

      _.each(disp, function(i){
        def = defs[i.column];
        if(def.isPrimary === true) {
          dataItem.key[def.columnName] = item[def.columnName];
        }

        if (item[def.columnName]) if (item[def.columnName]['@nil']) item[def.columnName] = '';
        if (!item[def.columnName]) item[def.columnName] = '';
        if (def.columnName==='name') dataItem['header'] = item[def.columnName];
        if (showGroups) {
          if(def.columnName === view.groupBy && def.dataType != 'DRP') unfilteredGroups.push(item[def.columnName]);
        }
        if(def.dataType === 'BLN') {
          if(item[def.columnName]===true || item[def.columnName]===1) dataItem[def.columnName] = '<i class="fa fa-check"></i>';
          else dataItem[def.columnName] = '<i class="fa fa-times"></i>';
        }
        else if(def.dataType === 'ICN') dataItem[def.columnName] = '<i class="fa '+item[def.columnName]+'"></i>';
        else if(def.dataType === 'EML') dataItem[def.columnName] = '<i class="fa fa-envelope"></i> ' + item[def.columnName];
        else if(def.dataType === 'CNT') dataItem[def.columnName] = '<i class="fa fa-flag"></i> ' + item[def.columnName];
        else if(def.dataType === 'TEL') dataItem[def.columnName] = '<i class="fa fa-phone"></i> ' + item[def.columnName];
        else if(def.dataType === 'CIT') dataItem[def.columnName] = '<i class="fa fa-university"></i> ' + item[def.columnName];
        else dataItem[def.columnName] = item[def.columnName];
      });

      if(smartView.parentDetail===true) dataItem['detail'] = 'detail';
      if(smartView.parentEdit===true) dataItem['edit'] = 'edit';
      if(smartView.parentDelete===true) dataItem['delete'] = 'delete';
      //console.log(dataItem);
      dataSet.push(dataItem);
    });

    if(showGroups) {
      unfilteredGroups = _.uniq(unfilteredGroups,false);
      //console.log(unfilteredGroups);
      groups = _.union(groups, unfilteredGroups);
    }

    colSet = {
      name: collectionId,
      collection: colItem,
      view: view,
      smartView: smartView,
      showGroups: showGroups,
      groupColumn: view.groupBy,
      groups: groups,
      columns: columns,
      data: dataSet
    };


    //console.log(colSet);
    self.added('viewSmartParentChild', Random.id(), colSet);
    self.ready();
  // } catch (e) {
  //   var err = {error: {location: 'ViewAllCrud', details: e}};
  //   console.log(EJSON.stringify(err, {indent: true}));
  // }

});
