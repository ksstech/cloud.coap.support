Meteor.publish("addEditOne", function(collectionId, isEdit, data, collectionGroup, collectionKey){
  var self = this;
  // try {
    //console.log({function:'addEditOne',collectionId: collectionId, isEdit: isEdit, data: data, collectionGroup: collectionGroup, collectionKey: collectionKey});
    var result = IMAG.addEditOne(collectionId, isEdit, data, collectionGroup, collectionKey)
    if(result.error) throw result.error;
    //console.log(result);
    self.added('addEditOne', collectionId, result);
    return self.ready();

  // } catch(e) {
  //   console.log(e);
  // }
});
