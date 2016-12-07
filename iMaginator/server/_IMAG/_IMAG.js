IMAG = {}
//returns the name of the collectionSsource
IMAG.GetCollectionSourceName = function (sourceId) {
  var collectionSource = CollectionSource.find({_id: sourceId}).fetch();
  return collectionSource[0].name;
}

IMAG.ObjToQueryString = function (data) {
  return Object.keys(data).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
  }).join('&');
};

IMAG.queryStringToJSON = function (url) {
    if (url === '')
        return '';
    var pairs = (url || location.search).slice(1).split('&');
    var result = {};
    for (var idx in pairs) {
        var pair = pairs[idx].split('=');
        if (!!pair[0])
            result[pair[0].toLowerCase()] = decodeURIComponent(pair[1] || '');
    }
    return result;
}

IMAG.RemoveEmpties = function (data) {
  for (var i in data) {
    if (data[i] === '' ) {
      delete data[i];
    }
  }
  return data;
};

IMAG.ArrayObjectExist = function(array, key, value) {
  var r = false;
  _.each(array, function(i){
    if(i[key] === value) {r = true;}
  });
  return r;
};

IMAG.ArrayGetObject = function(array,key,value) {
  var r = {};
  _.each(array, function(i){
    if(i[key] === value) {r = i;}
  });
  return r;
};

IMAG.getCollection = function(collectionId) {
  var collectionItem = CollectionItem.find({_id: collectionId}).fetch();
  collectionItem = _.isEmpty(collectionItem) ? {} : collectionItem[0];
  return collectionItem;
};

IMAG.getView = function(collectionId, viewType){
  var view = ViewCollection.find({collection: collectionId, viewType: viewType}).fetch();
  view = _.isEmpty(view) ? {} : view[0];
  return view;
};

IMAG.getDataDefinition = function(collectionId) {
  var defs = DataDefinition.find({collection: collectionId},{sort: {showInGrid: -1, gridOrder: 1}}).fetch();
  var defKeys = _.findWhere(defs,{isPrimary: true});
  if(!(defKeys instanceof Array)) defKeys = [defKeys];
  defs = _.indexBy(defs,'columnName');
  defs.keys = defKeys;
  return defs;
};

IMAG.hasHidden = function(defs) {
  var hasHidden = false;
  _.each(defs, function(item){
    if(item.showInGrid === false) hasHidden = true;
  });
  return hasHidden;
};

IMAG.getDSSFunction = function(collectionId, collectionFunction, collectionGroup) {
  if(!collectionGroup) collectionGroup = 'NONE';
  var fnc = CollectionFunction.find({collection: collectionId, collectionFunction: collectionFunction, collectionGroup: collectionGroup},{fields:{function: 1}}).fetch();
  //console.log({getDSSFunction: {params: [collectionId, collectionFunction, collectionGroup], fnc: fnc}});
  fnc = _.isEmpty(fnc) ? '' : fnc[0].function;
  return fnc;
}

IMAG.getSmartAddTemplate = function(smartChildType) {
  if(smartChildType==='SA') return 'smartAddWizzardMain';
  else return 'smartAddWizzardMain';
}

//return the data no matter where it is coming from
IMAG.getData = function(collection, key, functionType, isArray, group){
  //console.log({function:'getData',collection:collection,key:key,functionType:functionType,isArray:isArray,group:group});
  var parameters = {collection: collection, key: key, functionType: functionType};
  //console.log(isArray);
  if (isArray!=false) isArray = true;
  // ry{
    //get data source
    //now for the split
    var sourceName = IMAG.GetCollectionSourceName(collection.collectionSource);
    var data;
    //console.log(sourceName);
    if(sourceName==='Internal'){
      var col = global[collection.name];
      data = key ? col.find(key).fetch() : col.find().fetch();
    } else if (sourceName==='DSS_IMACS') {
      //console.log(sourceName);
      var url = Meteor.settings[sourceName]
      var options = {headers:{"Accept":"application/json"}};
      //console.log({collection: collection._id, collectionFunction: functionType});
      var fnc = IMAG.getDSSFunction(collection._id, functionType, group);
      //console.log(fnc);
      url +=  fnc;
      if(key) {
        var query = IMAG.ObjToQueryString(key);
        options['query'] = query;
      }
      console.log(url + '?' + query);
      data = HTTP.get(url, options);
      //console.log({url: url, options: options});
      //console.log(data);
      if(!data.data.Entries) data = [];
      else if(!data.data.Entries.Entry) data = [];
      else data = data.data.Entries.Entry;
    }
    //console.log(data);
    if(isArray===true) data = _.isArray(data) ? data : [data];
    else data = _.isArray(data) ? data[0] : data;
    return data
  // } catch (e) {
  //   console.log({error: {location: 'getData', parameters: parameters, details: e}});
  //   return {error: {location: 'getData', parameters: parameters, details: e}};
  // }
};

IMAG.addEditOne = function(collectionId, isEdit, data, collectionGroup, collectionKey){
  if(!collectionGroup) collectionGroup = 'NONE';
  var collectionItem = IMAG.getCollection(collectionId);
  //console.log({function:'collectionId',collectionId:collectionId, isEdit:isEdit, data:data, collectionGroup:collectionGroup, collectionKey:collectionKey});
  var definitions = DataDefinition.find({collection: collectionId},{sort: {detailsOrder: 1}}).fetch();
  //console.log(definitions);
  if(isEdit){
    var col = global[collectionItem.name];
    var getOneResult = IMAG.getData(collectionItem, data, 'SO', false, collectionGroup, collectionKey);
    //console.log(getOneResult);
    result = IMAG.getItemDefinition(collectionItem, definitions, true, getOneResult, collectionGroup, collectionKey);
  } else {
    result = IMAG.getItemDefinition(collectionItem, definitions, false, null, collectionGroup, collectionKey);
  }
  return result
}

IMAG.getItemDefinition = function (collection, definitions, isEdit, data, collectionGroup, collectionKey) {
  // try {
    var devs = [];
    var rules = {};
    if(!data) data = {};
    //console.log({collection: collection, defs: definitions, isEdit: isEdit, data: data});
    _.each(definitions, function(item){
      if(!item.isDerived) {
      if (data[item.columnName])
        if (data[item.columnName]['@nil']) data[item.columnName] = '';
      var definitionItem = {
        visible: true,
        isEdit: isEdit,
        canEdit: true,
        required: false,
        asterisk: '',
        isText: false,
        isLongText: false,
        isInteger: false,
        data: data[item.columnName] || null
        };
      //console.log(item);
      rules[item.columnName] = {};
      definitionItem.label = item.friendlyName;
      definitionItem.id = item.columnName;
      definitionItem.defaultValue = item.defaultValue;
      if(item.autoIncrement === true) definitionItem.visible = false;
      if(item.isPrimary === true) definitionItem.primary = true;
      if((item.isPrimary === true && isEdit === true) || item.canEdit === false) definitionItem.canEdit = false;
      if(item.isRequired === true) {
        if(item.dataType != 'BLN') {
          definitionItem.asterisk = '*';
          definitionItem.required = true;
          rules[item.columnName].required = true;
        }
      }
      if(item.isLookup === true) {
        var filter = "";
        if(item.lookupFilterColumn && item.lookupFilterValueColumn) {
          filter = item.lookupFilterColumn;
        }
        definitionItem.filterColumn = item.lookupFilterValueColumn;
        //console.log(item);
        definitionItem.lookupData = IMAG.getLookupData(
          item.lookupCollectionItem,
          item.lookupIdColumn,
          item.lookupDisplayColumn,
          filter
        );
        //console.log(definitionItem.lookupData);
        if(definitionItem.lookupData.error) throw definitionItem.lookupData.error;
        if(definitionItem.data != null) if (definitionItem.data != '0'){
          var temp = _.findWhere(definitionItem.lookupData, {id: definitionItem.data});
          if(!temp) temp = _.findWhere(definitionItem.lookupData, {name: definitionItem.data});
          //console.log(definitionItem.temp);
          //console.log(definitionItem);
          definitionItem.dataValue = temp.name;
        }
      }
      if(item.dataType === 'INT') {
        rules[item.columnName].digits = true;
        definitionItem.isInteger = true;
        definitionItem.template = 'siteBuilderDataTypeInteger';
      } else if(item.dataType === 'STR') {
        definitionItem.isText = true;
        definitionItem.template = 'siteBuilderDataTypeText';
      } else if(item.dataType === 'LST') {
        definitionItem.isLongText = true;
        definitionItem.template = 'siteBuilderDataTypeTextArea';
      } else if(item.dataType === 'BLN') {
        definitionItem.template = 'siteBuilderDataTypeBoolean';
      } else if(item.dataType === 'DRP') {
        definitionItem.template = 'siteBuilderDataTypePlainDropDown';
      } else if(item.dataType === 'ICN') {
        definitionItem.template = 'siteBuilderDataTypeIconLookup';
      } else if(item.dataType === 'EML') {
        definitionItem.isText = true;
        rules[item.columnName].email = true;
        definitionItem.template = 'siteBuilderDataTypeText';
      } else {
        definitionItem.isText = true;
        definitionItem.template = 'siteBuilderDataTypeText';
      }

      devs.push(definitionItem);
    }
    });
    //console.log(devs);
    definitionSet = {
      name: collection.name,
      friendlyName: collection.displayName,
      id: collection._id,
      isEdit: isEdit,
      collection: collection,
      collectionGroup: collectionGroup,
      keys: collectionKey,
      definitions: devs,
      rules: rules
    };
    //console.log(definitionSet.definitions);
    return definitionSet;
  // } catch (e) {
  //   return {error: {location: 'getItemDefinition', details: e}};
  // }
};

IMAG.getLookupData = function (collection, idColumn, nameColumn, filter) {
  var params = {collection: collection, idColumn: idColumn, nameColumn: nameColumn, filter: filter};
  //console.log(params);
  // try {
    var collectionItem = IMAG.getCollection(collection);
    //console.log(collectionItem[0]);
    var sourceName = IMAG.GetCollectionSourceName(collectionItem.collectionSource);
    var getResult = [];
    if(sourceName === 'Internal') {
      var col = global[collectionItem.name];
      var options = {fields: {}, sort: {}};
      options.fields[idColumn] = 1,
      options.fields[nameColumn] = 1;
      options.fields[filter] = 1;
      options.sort[nameColumn] = 1;
      getResult = col.find({},options).fetch();
      //console.log(getResult);
    }
    else if (sourceName === 'DSS_IMACS') {
      var url = Meteor.settings[sourceName]
      var options = {headers:{"Accept":"application/json"}};
      //console.log(collection);
      var fnc = CollectionFunction.find({collection: collection, collectionFunction: 'SL'},{fields:{function: 1}}).fetch();
      //console.log(fnc);
      url +=  fnc[0].function;
      console.log(url);
      var data = HTTP.get(url, options);
      //console.log(data);
      if(!data.data.Entries) {
        //console.log(data);
        getResult =  [];
      }
      if(!data.data.Entries.Entry) getResult =  [];
      else getResult = data.data.Entries.Entry;
      if(!(getResult instanceof Array)) getResult = [getResult];
    }
    var lookupData = [];
    //console.log(getResult);
    _.each(getResult, function(item){
      lookupData.push({id: item[idColumn], name: item[nameColumn], filter: item[filter]});
    });
    //console.log(lookupData);
    return lookupData;
  // } catch (e) {
  //   return {error: {location: 'getLookupData', parameters: params, details: e}};
  // }
};

IMAG.getDetailAllSmartChild = function(collectionId, filter, filterFunction, filterGroup) {
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
    return {
      name: collectionId,
      collection: colItem,
      showGroups: showGroups,
      groupColumn: view.groupBy,
      groups: groups,
      columns: columns,
      data: dataSet
    };
};
