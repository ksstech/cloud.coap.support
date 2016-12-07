Meteor.publish('navMenuItems', function(){
  var self = this;
  try {
    return NavMenuItem.find();//.fetch();
  } catch (e) {
    console.log(e);
  }
});
