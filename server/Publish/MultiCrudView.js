Meteor.publish('multiCrudView', function (collectionId) {
  var self = this;
  //try {
  var colItem = IMAG.getCollection(collectionId);
  var view = IMAG.getView(collectionId,'MCV');
  //console.log(view);
  var viewChildren = ViewChildren.find({view: view._id}).fetch();
  //console.log(viewChildren);
  var children = [];
  _.each(viewChildren, function(i){
    var childCol = IMAG.getCollection(i.collection);
    children.push({collectionId: i.collection, displayName: childCol.displayName,
      smartChildType: i.smartChildType, order: i.order, collectionGroup: i.collectionGroup, icon: childCol.icon});
  })
  // use generic template as far as possible
  // template have header, icon, logo and description fields that can be described per collection

  var main = {
    collectionId: collectionId,
    header: view.header,
    icon: view.icon,
    //mainData
    children: children
  };

  //console.log(main);
  self.added('multiCrudViewData', Random.id(), main);
  self.ready();
// } catch (e) {
//   var err = {error: {location: 'ViewAllCrud', details: e}};
//   console.log(EJSON.stringify(err, {indent: true}));
// }

});
