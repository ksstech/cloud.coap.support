Meteor.publish('DetailSmartParentChild', function (collectionId, data) {
  var self = this;
  //try {
  //console.log({name:'DetailSmartParentChild',collectionId:collectionId,data:data});
  var colItem = IMAG.getCollection(collectionId);
  var view = IMAG.getView(collectionId,'VDSPC');

  var defs = IMAG.getDataDefinition(collectionId);
  //console.log(defs);
  var keys = {};
  _.each(defs.keys, function(i){
    keys[i.columnName] = data[i.columnName];
  });
  var viewChildren = ViewChildren.find({view: view._id}).fetch();
  //console.log(viewChildren);
  var children = [];
  _.each(viewChildren, function(i){
    var childCol = IMAG.getCollection(i.collection);
    children.push({collectionId: i.collection, displayName: childCol.displayName, key: keys,
      smartChildType: i.smartChildType, order: i.order, collectionGroup: i.collectionGroup, icon: childCol.icon});
  })
  //console.log({colectionId: collectionId, keys: keys});
  var getOneResult = IMAG.getData(colItem,keys,'SOF', false);
  //console.log(getOneResult);
  //console.log({collection: collectionId, view: view._id});
  var disp = ViewColumn.find({collection: collectionId, view: view._id}, {sort:{order:1}}).fetch();
  //console.log(disp);
  // use generic template as far as possible
  // template have header, icon, logo and description fields that can be described per collection

  var main = {
    collectionId: collectionId,
    header: view.header,
    icon: view.icon,
    //mainData
    children: children
  };
  var mainData = {
    //header: data.name,
    //icon: data.icon,
    //logo: data.logo,
    //description: data.description,
    collectionId:collectionId,
    key:{},
    data:[]
  }
  //console.log(getOneResult);
  var tempData = [];
  _.each(disp, function(i){
    var def = defs[i.column];
    if(def.isPrimary === true) { mainData.key[def.columnName] = getOneResult[def.columnName];}
    else tempData.push({key: def.columnName, name: def.friendlyName, value: getOneResult[def.columnName]});
  });

  if(colItem.name==='tbl_organisation'){
    //console.log(tempData);
    _.each(tempData, function(i){
      if(i.key==='name') mainData.header = i.value;
      else if (i.key==='description') mainData.description = i.value;
      else mainData.data.push(i);
    });
  } else {
    _.each(tempData, function(i){
      if(i.key==='name') mainData.header = i.value;
      else if (i.key==='description') mainData.description = i.value;
      else mainData.data.push(i);
    });
  }
  main.mainData = mainData;

  //get the child data for the display


  //console.log(main);
  self.added('detailSmartParentChild', Random.id(), main);
  self.ready();
// } catch (e) {
//   var err = {error: {location: 'ViewAllCrud', details: e}};
//   console.log(EJSON.stringify(err, {indent: true}));
// }

});
