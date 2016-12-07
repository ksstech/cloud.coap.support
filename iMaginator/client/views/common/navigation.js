MenuItems = new Mongo.Collection('menuItems');

Template.navigation.onCreated(function(){
  var self = this;
  self.autorun(function(){
    var sub = self.subscribe('navMenuItems');
  });


  self.dataItems = function(){
    var results = [];
    //start with top level no parents

    var top = NavMenuItem.find({parent: {$exists: false}},{sort: {order: 1}}).fetch();
    //console.log(top);
    _.each(top, function(item){
      var topMenuItem = {
        displayName: item.displayName,
        description: item.description,
        menuItemType: item.menuItemType,
        icon: item.icon,
        route: item.route,
        collection: item.collection,
        dataSource: item.dataSource,
        view: item.view,
        data: item.data,
        activePath: item.data || item.collection
      };
      //console.log(topMenuItem);
      //check for children
      var children = NavMenuItem.find({parent: item._id}, {sort: {order: 1}});
      if (children.count() > 0) {
        topMenuItem.hasChildren = true;
        topMenuItem.children = [];
        var regexTemp = [];
        children.forEach(function(childItem){
          var childMenuItem = {
            displayName: childItem.displayName,
            description: childItem.description,
            menuItemType: childItem.menuItemType,
            icon: childItem.icon,
            route: '/' + childItem.route + '/' + childItem.collection,
            collection: childItem.collection,
            view: childItem.view,
            dataSource: childItem.dataSource,
            data: childItem.data,
            activePath: childItem.collection || childItem.data,
            regexData: childItem.route + '\/' + childItem.collection
          };
          regexTemp.push(childMenuItem.regexData);
          topMenuItem.children.push(childMenuItem);
          //console.log({childColelction:childMenuItem.regexData});
        });
        topMenuItem.regexData = regexTemp.join('|');
        //console.log({regexdata:topMenuItem.regexData});

     } else {
       topMenuItem.regexData = topMenuItem.displayName;
     }
     //console.log({parentCollection:topMenuItem.displayName});
     results.push(topMenuItem);
    });
    console.log(results);
    return results;
  }
});

Template.navigation.rendered = function(){
  // Initialize metisMenu
    $('#side-menu').metisMenu({
      collapseClass: 'false'
    });
};

// Used only on OffCanvas layout
Template.navigation.events({

    'click .close-canvas-menu' : function(){
        $('body').toggleClass("mini-navbar");
    }

});

Template.navigation.helpers({
  menuItems: function(){
    return Template.instance().dataItems();
  },
  loading: function(){ return Session.get('loading'); },
  checkActive: function(regex){
    if (ActiveRoute.path(new RegExp(regex))) return 'active';
    else return '';
  },
  checkActiveUL: function(regex){
    if (ActiveRoute.path(new RegExp(regex))) return 'in';
    else return '';
  }

});
