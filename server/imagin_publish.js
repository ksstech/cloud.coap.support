Collections = new Mongo.Collection('collections');
Definitions = new Mongo.Collection('definitions');
CollectionSets = new Mongo.Collection('collectionSets');
DefinitionSets = new Mongo.Collection('definitionSets');

Meteor.publish('pubCollectionSet', function(collection, user, forceUpdate){
  var self = this;

  try {
    var existingSet = CollectionSets.findOne({id: collection});
    var exist = false;
    if(existingSet) exist = true;
    //console.log(collectionSet);
    if(!forceUpdate) forceUpdate = true;
    forceUpdate = true;
    if(forceUpdate === true || exist === false) {
      //get the collection info
      var urlCollections = Meteor.settings.wso2dss.url + Meteor.settings.wso2dss.imagin + Meteor.settings.wso2dss.imaginOperations.getOneCollection;

      var collectionsResult = HTTP.get(urlCollections, {headers:{"Accept":"application/json"}, query: "param0=" + collection});
      if(!collectionsResult.data.Entries.Entry) throw urlCollections + ": returned unusable data";
      collectionsResult = collectionsResult.data.Entries.Entry;
      //console.log(collectionsResult);
      var urlDefinitions = Meteor.settings.wso2dss.url + Meteor.settings.wso2dss.imagin + Meteor.settings.wso2dss.imaginOperations.getSomeDefinitions;
      var definitionResult = HTTP.get(urlDefinitions, {headers:{"Accept":"application/json"}, query: "param0=" + collectionsResult.id_collection});
      if(!definitionResult.data.Entries.Entry) throw urlDefinitions + ": returned unusable data";
      definitionResult = definitionResult.data.Entries.Entry;

      var columns = [];
      var xedit = {
        name: 'edit',
        orderable: false,
        defaultContent: '<button type="button" class="btn btn-info btn-xs" value="edit"><i class="fa fa-paste">&nbsp;Edit</button>'
      };
      columns.push(xedit);
      var xkey = {
        name: 'key',
        orderable: false,
        data: 'key',
        visible: false
      };
      columns.push(xkey);
      _.each(definitionResult, function(item){
        var col = {
          title: item.default_friendly_name,
          name: item.column_name,
          data: item.column_name
        };
        columns.push(col);
      });
      var xdelete = {
        name: 'delete',
        orderable: false,
        defaultContent: '<button type="button" class="btn btn-danger btn-xs" value="delete"><i class="fa fa-times">&nbsp;Delete</button>'
      };
      columns.push(xdelete);
      //console.log(columns);
      var urlSelectAll = Meteor.settings.wso2dss.url + collectionsResult.api_select_all;
      //console.log(definitionResult);
      var selectAllResult = HTTP.get(urlSelectAll, {headers:{"Accept":"application/json"}});
      if(!selectAllResult.data.Entries.Entry) throw urlSelectAll + ": returned unusable data";
      selectAllResult = selectAllResult.data.Entries.Entry;
      //console.log(selectAllResult);
      var data = [];

      _.each(selectAllResult, function(item){
        var record = {
          recordId: '',
          keys: [],
          fields: []
        };
        var dataItem = {
          key: ""
        };

        dataItem['edit'] = 'yy';
        _.each(definitionResult, function(def){
          //console.log(def);
          if(def.is_primary === 'true') {
            dataItem.key += def.column_name + "=" + item[def.column_name];
          }
          dataItem[def.column_name] = item[def.column_name];
        });
        dataItem['delete'] = 'xx';
        data.push(dataItem);
      });
      collectionSet = {
        id: collection,
        collection: collectionsResult,
        columns: columns,
        definitions: definitionResult,
        data: data
      };
      //console.log(collectionSet.data);
      if (forceUpdate === true && exist === true) {
        CollectionSets.update({id: collectionSet.id}, collectionSet);
        this.changed('collectionSets',existingSet._id, collectionSet);
      }
      else {
        CollectionSets.insert(collectionSet);
        this.added('collectionSets',collectionSet.id, collectionSet);
      }
    }
    self.ready();
  } catch (e) {
    console.log(e);

  }
});

Meteor.methods({
  addSiteBuilderDataItem: function(userId, collection, data) {
    this.unblock();
    console.log('adding');
    try {
      var collectionItem = getCollectionItem(collection);
      if(collectionItem.error) throw collectionItem.error;
      var queryString = objToQueryString(data);
      var urlTarget = Meteor.settings.wso2dss.url + collectionItem.api_add;
      console.log(urlTarget + ':' + queryString)
      var targetResult = HTTP.get(urlTarget, {headers:{"Accept":"application/json"}, query: queryString});
      return;
    } catch (e) {
      var err = {error: {location: 'addSiteBuilderDataItem', details: e}};
      console.log(EJSON.stringify(err, {indent: true}));
      return err;
    }
  },
  updateSiteBuilderDataItem: function(userId, collection, data) {
    this.unblock();
    var collectionItem = getCollectionItem(collection);
    if(collectionItem.error) throw collectionItem.error;
    var queryString = objToQueryString(data);
    var urlTarget = Meteor.settings.wso2dss.url + collectionItem.api_update;
    var targetResult = HTTP.get(urlTarget, {headers:{"Accept":"application/json"}, query: queryString});
    return;
  },
  deleteSiteBuilderDataItem: function(userId, collection, data) {
    this.unblock();
    var collectionItem = getCollectionItem(collection);
    if(collectionItem.error) throw collectionItem.error;
    var queryString = objToQueryString(data);
    var urlTarget = Meteor.settings.wso2dss.url + collectionItem.api_delete;
    var targetResult = HTTP.get(urlTarget, {headers:{"Accept":"application/json"}, query: queryString});
    return;
  },
  getSiteBuilderDataList: function(userId, collection) {
    this.unblock();
    try {
    var collectionItem = getCollectionItem(collection);
    if(collectionItem.error) throw collectionItem.error;
    var definitions = getDefinitionItems(collectionItem.id_collection);
    var columns = [];
    var xedit = {
      name: 'edit',
      orderable: false,
      defaultContent: '<button type="button" class="btn btn-info btn-xs" value="edit"><i class="fa fa-paste">&nbsp;Edit</button>'
    };
    columns.push(xedit);
    var xkey = {
      name: 'key',
      orderable: false,
      data: 'key',
      visible: false
    };
    columns.push(xkey);
    _.each(definitions, function(item){
      var col = {
        title: item.default_friendly_name,
        name: item.column_name,
        data: item.column_name
      };
      columns.push(col);
    });
    var xdelete = {
      name: 'delete',
      orderable: false,
      defaultContent: '<button type="button" class="btn btn-danger btn-xs" value="delete"><i class="fa fa-times">&nbsp;Delete</button>'
    };
    columns.push(xdelete);

    var urlTarget = Meteor.settings.wso2dss.url + collectionItem.api_select_all;
    var targetResult = HTTP.get(urlTarget, {headers:{"Accept":"application/json"}});
    if(!targetResult.data.Entries.Entry) throw urlTarget + ": returned unusable data";
    targetResult = targetResult.data.Entries.Entry;

    var data = [];

    _.each(targetResult, function(item){
      var record = {
        recordId: '',
        keys: [],
        fields: []
      };
      var dataItem = {
        key: ""
      };

      dataItem['edit'] = 'yy';
      _.each(definitions, function(def){
        if(def.is_primary === 'true') {
          dataItem.key += def.column_name + "=" + item[def.column_name];
        }
        if (item[def.column_name]['@nil']) item[def.column_name] = '';
        if(def.fk_data_type === '4') {
          if(item[def.column_name]==='true') dataItem[def.column_name] = '<i class="fa fa-check"></i>';
          else dataItem[def.column_name] = '<i class="fa fa-times"></i>';
        }
        else if(def.fk_data_type === '11') dataItem[def.column_name] = '<i class="fa '+item[def.column_name]+'"></i>';
        else dataItem[def.column_name] = item[def.column_name];
        //console.log({type: def.fk_data_type, item: item[def.column_name], data: dataItem[def.column_name]});
      });
      dataItem['delete'] = 'xx';
      data.push(dataItem);
    });
    collectionSet = {
      id: collection,
      collection: collectionItem,
      columns: columns,
      definitions: definitions,
      data: data
    };
    return collectionSet;
    }
    catch (e) {
      var err = {error: {location: 'getSiteBuilderDataList', details: e}};
      console.log(EJSON.stringify(err, {indent: true}));
      return err;
    }
  },
  getSiteBuilderDataAddEdit: function(userId, collection, isEdit, params) {
    this.unblock();
    try {
      var collectionItem = getCollectionItem(collection);
      if(collectionItem.error) throw collectionItem.error;
      var definitions = getDefinitionItems(collectionItem.id_collection);
      var result = null;
      if(isEdit){
        var queryString = objToQueryString(params);
        var urlGetItem = Meteor.settings.wso2dss.url + collectionItem.api_select_one;
        var getOneResult = HTTP.get(urlGetItem, {headers:{"Accept":"application/json"}, query: queryString});
        if(!getOneResult.data.Entries.Entry) throw urlGetItem + ':' + queryString + ": returned unusable data";
        getOneResult = getOneResult.data.Entries.Entry;
        result = getItemDefinition(collectionItem, definitions, true, getOneResult);
      } else {
        result = getItemDefinition(collectionItem, definitions, false);
      }
      if(result.error) throw result.error;
      return result;
    } catch(e) {
      var err = {error: {location: 'getSiteBuilderDataAdd', details: e}};
      console.log(EJSON.stringify(err, {indent: true}));
      return err;
    }
  },
});


function getCollectionItem(collectionName){
  try {
    var collectionItem = null; //Collections.findOne({id: collectionName});
    if(collectionItem) return collectionItem;
    else {
      var urlCollections = Meteor.settings.wso2dss.url + Meteor.settings.wso2dss.imagin + Meteor.settings.wso2dss.imaginOperations.getOneCollection;
      var collectionsResult = HTTP.get(urlCollections, {headers:{"Accept":"application/json"}, query: "param0=" + collectionName});
      if(!collectionsResult.data.Entries.Entry) throw urlCollections + ':' + collectionName + ": returned unusable data";
      collectionsResult = collectionsResult.data.Entries.Entry;
      collectionsResult.id = collectionName;
      var result = Collections.insert(collectionsResult);
      return collectionsResult;
    }
  } catch (e) {
    return {error: {location: 'getCollectionItem', details: e}};
  }
};


function getDefinitionItems(collection_id) {
  var definitionItems = null; //Definitions.find({fk_collection_id: collection_id}, {sort:{order: 1}});
  if(definitionItems) return definitionItems;
  else {

    var urlDefinitions = Meteor.settings.wso2dss.url + Meteor.settings.wso2dss.imagin + Meteor.settings.wso2dss.imaginOperations.getSomeDefinitions;
    var definitionResult = HTTP.get(urlDefinitions, {headers:{"Accept":"application/json"}, query: "param0=" + collection_id});

    if(!definitionResult.data.Entries.Entry) throw urlDefinitions + ": returned unusable data";
    definitionResult = definitionResult.data.Entries.Entry;

    if(definitionResult.forEach){
      definitionResult.forEach(function(item){
        var result = Definitions.insert({id: item.id_data_definition});
      });
      return definitionResult;
    } else {
      var result = Definitions.insert({id: definitionResult.id_data_definition});
      return [definitionResult];
    }

  }
};

function objToQueryString(data) {
  return Object.keys(data).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
  }).join('&');
};

function getItemDefinition(collection, definitions, isEdit, data) {
  try {
    var devs = [];
    var rules = {};
    if(!data) data = {};

    _.each(definitions, function(item){
      var definitionItem = {
        visible: true,
        isEdit: isEdit,
        required: false,
        asterisk: '',
        isText: false,
        isLongText: false,
        isInteger: false,
        data: data[item.column_name] || null
        };
      rules[item.column_name] = {};
      definitionItem.label = item.default_friendly_name;
      definitionItem.id = item.column_name;
      definitionItem.defaultValue = item.default_value;
      if(item.auto_increment === 'true') definitionItem.visible = false;
      if(item.is_required === 'true') {
        definitionItem.asterisk = '*';
        definitionItem.required = true;
        rules[item.column_name].required = true;
      }
      if(item.is_lookup === 'true') {
        definitionItem.lookupData = getLookupData(
          item.lookup_collection,
          item.lookup_id_column,
          item.lookup_display_column
        );
        if(definitionItem.lookupData.error) throw definitionItem.lookupData.error;
      }
      if(item.fk_data_type === '1') {
        rules[item.column_name].digits = true;
        definitionItem.isInteger = true;
        definitionItem.template = 'siteBuilderDataTypeInteger';
      }
      else if(item.fk_data_type === '2') {
        definitionItem.isText = true;
        definitionItem.template = 'siteBuilderDataTypeText';
      }
      else if(item.fk_data_type === '3') {
        definitionItem.isLongText = true;
        definitionItem.template = 'siteBuilderDataTypeTextArea';
      }
      else if(item.fk_data_type === '4') {
        definitionItem.isLongText = true;
        definitionItem.template = 'siteBuilderDataTypeBoolean';
      }
      else if(item.fk_data_type === '10') {
        definitionItem.template = 'siteBuilderDataTypeSimpleDropDown';
      }
      else if(item.fk_data_type === '11') {
        definitionItem.template = 'siteBuilderDataTypeIconLookup';
      }

      else {
        definitionItem.isText = true;
        definitionItem.template = 'siteBuilderDataTypeText';
      }

      devs.push(definitionItem);
    });
    //console.log(devs);
    definitionSet = {
      id: collection.collection_name,
      isEdit: isEdit,
      collection: collection,
      definitions: devs,
      rules: rules
    };
    //console.log(definitionSet.definitions);
    return definitionSet;
  } catch (e) {
    return {error: {location: 'getItemDefinition', details: e}};
  }
};

function getLookupData(collection, idColumn, nameColumn) {
  try {
    var collectionItem = getCollectionItem(collection);
    if(collectionItem.error) throw collectionItem.error;
    var urlTarget = Meteor.settings.wso2dss.url + collectionItem.api_select_all;
    var targetResult = HTTP.get(urlTarget, {headers:{"Accept":"application/json"}});
    if(!targetResult.data.Entries.Entry) throw urlTarget + ": returned unusable data";
    targetResult = targetResult.data.Entries.Entry;
    var lookupData = [];
    _.each(targetResult, function(item){
      lookupData.push({id: item[idColumn], name: item[nameColumn]});
    });

    return lookupData;
  } catch (e) {
    return {error: {location: 'getLookupData', details: e}};
  }
};
