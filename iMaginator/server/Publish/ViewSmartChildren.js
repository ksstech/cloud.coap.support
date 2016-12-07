Meteor.publish("ViewSmartChildren", function(collectionId, key){
  var self = this;
  //get collection
  //console.log({collectionId: collectionId, key: key});
  var collectionItem = IMAG.getCollection(collectionId);
  //console.log({col: collectionItem});
  //get view
  var viewItem = IMAG.getView(collectionId,'VASPC');
  //console.log({view: viewItem});
  //get view children
  var viewChildren = ViewChildren.find({view: viewItem._id}, {sort: {order: 1}}).fetch();
  var children = [];
  //iterate through children
  //console.log({children: viewChildren});
  _.each(viewChildren, function(child){
    var col = IMAG.getCollection(child.collection);
    if(child.smartChildType === 'ORG') {
      var getOneItem = IMAG.getData(col, key, 'SOF', false, child.collectionGroup);
      children.push({template: 'viewSmartOrg', data: getOneItem});
    } else if (child.smartChildType === 'ADDRSS'){
      var getItems = IMAG.getData(col, key,'SA', true, child.collectionGroup);
      //suppose to be an Array
      //console.log({childCol: getItems, key: key});
      _.each(getItems, function(item) {
        item.part1 = item.address_line_1;
        item.part1 += (item.address_line_2 ? ', ' + item.address_line_2 : '');
        item.part1 += (item.address_line_3 ? ', ' + item.address_line_3 : '');
        item.part1 += (item.address_line_4 ? item.address_line_4 : '');
        item.part2 = (item.locality ? item.locality + ', ': '');
        item.part2 += item.city;
        item.part2 += (item.code ? ', ' + item.code : '');
      });
      children.push({template: 'viewSmartAddresses', data: getItems});
    } else if (child.smartChildType === 'PHNS'){
      var getItems = IMAG.getData(col, key, 'SA', true, child.collectionGroup);
      children.push({template: 'viewSmartTelephones', data: getItems});
    } else if (child.smartChildType === 'EMLS'){
      var getItems = IMAG.getData(col, key, 'SA', true, child.collectionGroup);
      children.push({template: 'viewSmartEmails', data: getItems});
    } else if (child.smartChildType === 'SL'){
      var defs = DataDefinition.find({collection: col._id},{sort: {showInGrid: -1, gridOrder: 1}}).fetch();
      var getItems = IMAG.getData(col, key, 'SA', true, child.collectionGroup);
      var columns = [];
      _.each(defs, function(item){
        var col = {title: item.friendlyName, name: item.columnName, data: item.columnName, visible: item.showInGrid || false};
        if(item.dataType==='DRP'){
        item.lookupData = IMAG.getLookupData(item.lookupCollectionItem, item.lookupIdColumn, item.lookupDisplayColumn, '');
        }
        columns.push(col);
      });
      var data = {header: col.displayName, icon: col.icon, collectionId: col._id, columns: columns, list: getItems};
      children.push({template: 'viewSmartList', data: data});
    } else if (child.smartChildType === 'SP'){
      var defs = IMAG.getDataDefinition(col._id);
      //console.log(defs);
      var getItems = IMAG.getData(col, key, 'SOF', false, child.collectionGroup);
      //console.log(getItems);
      var ret = [];
      _.each(getItems, function(v, k){
        if(v['@nil']) v = '';
        //console.log(v);
        var x = {key: defs[k].friendlyName, value: v};
        ret.push(x);
      });
      //console.log(ret);
      children.push({template: 'viewSmartProperties', data: ret});
    } else if (child.smartChildType === 'SCT'){
      var defs = DataDefinition.find({collection: col._id},{sort: {showInGrid: -1, gridOrder: 1}}).fetch();
      var getItems = IMAG.getData(col, key, 'SA', true, child.collectionGroup);
        var childCol = IMAG.getCollection(col._id);
        children.push({collectionId: col._id, displayName: childCol.displayName, key: key,
          smartChildType: child.smartChildType, order: child.order, collectionGroup: child.collectionGroup, icon: childCol.icon});
    }


  });
  //get collection single data
  //we need to know the type, org details , person details etc. different templates you see
  //console.log(children);
  self.added('smartChildren', Random.id(), {data: children});
  self.ready();
  //get definition
  //get children definition
  //get children collections
  //retrun;
});
