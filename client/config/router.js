CollectionSets = new Mongo.Collection('collectionSets');
DefinitionSets = new Mongo.Collection('definitionSets');
ViewAll = new Mongo.Collection('viewAll');
AddEditOne = new Mongo.Collection('addEditOne');
LandingPageData = new Mongo.Collection('landingPageData');
ViewSmartParentChild = new Mongo.Collection('viewSmartParentChild');
DetailSmartParentChild = new Mongo.Collection('detailSmartParentChild');
AddSmartWizzard = new Mongo.Collection('addSmartWizzard');
MultiCrudViewData = new Mongo.Collection('multiCrudViewData');

Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'

});

//
// Dashboards routes
//

Router.route('/general/:collection', {
  name: 'general',
  action: function(){
    this.render('dashboard1');
  }
});
/*Router.route('/dashboard2', function () {
    this.render('dashboard2');
});
Router.route('/dashboard3', function () {
    this.render('dashboard3');
});
Router.route('/dashboard4', function () {
    this.render('dashboard4');
    this.layout('layout2');
});
Router.route('/dashboard4l', function () {
    this.render('dashboard4l');
});
Router.route('/dashboard5', function () {
    this.render('dashboard5');
});
*/

Router.route('/ViewAllCrud/:collection', {
  name: 'ViewAllCrud',
  waitOn: function() {
    return Meteor.subscribe('ViewAllCrud', this.params.collection);
  },
  action: function() {
    this.render('ViewAllCrud', {
      data: function() {
        var d = ViewAll.find({_id: this.params.collection}).fetch();
        return d[0];
      },
    });
  }
});

Router.route('/Crud/add/:collection', {
  name: 'Crud/add',
  waitOn: function() {
    return Meteor.subscribe('addEditOne', this.params.collection, false);
  },
  action: function() {
    this.render('siteBuilderAddEdit', {
      data: function() {
        var d = AddEditOne.find().fetch();
        return d[0];
      },
    });
  }
});

Router.route('/Crud/addnew/:collection', {
  name: 'Crud/addnew',
  waitOn: function() {
    return Util.waitOnServer('addItem', this.params.collection, this.params.query);
  },
  action: function() {
    Router.go('ViewAllCrud', {collection: this.params.collection});
  }
});

Router.route('/Crud/edit/:collection', {
  name: 'Crud/edit',
  waitOn: function() {
    return Meteor.subscribe('addEditOne', this.params.collection, true, this.params.query);
  },
  action: function() {
    this.render('siteBuilderAddEdit', {
      data: function() {
        var d = AddEditOne.find().fetch();
        return d[0];
      },
    });
  }
});

Router.route('/Crud/update/:collection', {
  name: 'Crud/update',
  waitOn: function() {
      return Util.waitOnServer('updateItem', this.params.collection, this.params.query);
  },
  action: function() {
    Router.go('ViewAllCrud', {collection: this.params.collection});
  }
});

Router.route('/Crud/delete/:collection', {
  name: 'Crud/delete',
  waitOn: function() {
    return Util.waitOnServer('deleteItem', this.params.collection, this.params.query);
  },
  action: function() {
    Router.go('ViewAllCrud', {collection: this.params.collection});
  }
});

Router.route('/LandingPage/:data', {
  name: 'LandingPage',
  waitOn: function() {
    return Meteor.subscribe('pubLandingPage', this.params.data, true, this.params.query);
  },
  action: function() {
    this.render('landingBuilder', {
      data: function() {
        var d = LandingPageData.find().fetch();
        return d[0];
      },
    });
    this.layout('blankLayout')
  }

});

//////////////////////////////////////////////////////////////////////

Router.route('/ViewSmartParentChild/:collection', {
  name: 'ViewSmartParentChild',
  waitOn: function() {
    return Meteor.subscribe('ViewSmartParentChild', this.params.collection);
  },
  action: function() {
    this.render('viewSmartParentChild', {
      data: function() {
        var d = ViewSmartParentChild.find().fetch();
        return d[0];
      },
    });
  }
});

Router.route('/DetailSmartParentChild/:collection', {
  name: 'DetailSmartParentChild',
  waitOn: function() {
    return Meteor.subscribe('DetailSmartParentChild', this.params.collection, this.params.query);
  },
  action: function() {
    this.render('detailSmartParentChild', {
      data: function() {
        var d = DetailSmartParentChild.find().fetch();
        return d[0];
      },
    });
  }
});

Router.route('/DetailSmartParentChild/update/:collection/:collectionGroup', {
  name: 'DetailSmartParentChild/update',
  waitOn: function() {
      return Util.waitOnServer('updateItem', this.params.collection, this.params.query, this.params.collectionGroup);
  },
  action: function() {
    Router.go('DetailSmartParentChild', {collection: this.params.collection}, {query: this.params.query});
  }
});

Router.route('/DetailSmartParentChild/add/:collection/:collectionGroup', {
  name: 'DetailSmartParentChild/add',
  waitOn: function() {
      return Util.waitOnServer('addItem', this.params.collection, this.params.query, this.params.collectionGroup);
  },
  action: function() {
    Router.go('DetailSmartParentChild', {collection: this.params.collection}, {query: this.params.query});
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Router.route('/ViewSmartAddWizzard/:collection', {
  name: 'ViewSmartAddWizzard',
  waitOn: function() {
    return Meteor.subscribe('addEditOne', this.params.collection, false);
  },
  action: function() {
    this.render('smartAddWizzard', {
      data: function() {
        var d = AddEditOne.find().fetch();
        //console.log(d);
        return d[0];
      },
    });
  }
});

Router.route('/ViewSmartAddWizzard/addnew/:collection', {
  name: 'ViewSmartAddWizzard/addnew',
  waitOn: function() {
    return Util.waitOnServer('addItem', this.params.collection, this.params.query);
  },
  action: function() {
    var key = Util.getResponse('addItem')
    Router.go('DetailSmartParentChild', {collection: this.params.collection}, {query: key});
  }
});

Router.route('/MultiCrudView/:collection', {
  name: 'MultiCrudView',
  waitOn: function() {
    return Meteor.subscribe('multiCrudView', this.params.collection);
  },
  action: function() {
    this.render('multiCrudView', {
      data: function() {
        var d = MultiCrudViewData.find().fetch();
        //console.log(d);
        return d[0];
      },
    });
  }
});
//
// Layouts route
//

Router.route('/layouts', function () {
    this.render('layouts');
});

//
// Graphs routes
//

Router.route('/graphFlot', function () {
    this.render('graphFlot');
});

Router.route('/graphRickshaw', function () {
    this.render('graphRickshaw');
});

Router.route('/graphChartJs', function () {
    this.render('graphChartJs');
});

Router.route('/graphChartist', function () {
    this.render('graphChartist');
});

Router.route('/graphPeity', function () {
    this.render('graphPeity');
});

Router.route('/graphSparkline', function () {
    this.render('graphSparkline');
});

//
// Mailbox
//

Router.route('/mailbox', function () {
    this.render('mailbox');
});

Router.route('/emailView', function () {
    this.render('emailView');
});

Router.route('/emailCompose', function () {
    this.render('emailCompose');
});

Router.route('/emailTemplates', function () {
    this.render('emailTemplates');
});

//
// Widgets
//

Router.route('/widgets', function () {
    this.render('widgets');
});

//
// Metrics
//

Router.route('/metrics', function () {
    this.render('metrics');
});

//
// Forms
//

Router.route('/formBasic', function () {
    this.render('formBasic');
});

Router.route('/formAdvanced', function () {
    this.render('formAdvanced');
});

Router.route('/formWizard', function () {
    this.render('formWizard');
});

Router.route('/formUpload', function () {
    this.render('formUpload');
});

Router.route('/textEditor', function () {
    this.render('textEditor');
});

//
// App Views
//

Router.route('/contacts', function () {
    this.render('contacts');
});

Router.route('/profile', function () {
    this.render('profile');
});

Router.route('/profile2', function () {
    this.render('profile2');
});

Router.route('/contacts2', function () {
    this.render('contacts2');
});

Router.route('/projects', function () {
    this.render('projects');
});

Router.route('/projectDetail', function () {
    this.render('projectDetail');
});

Router.route('/teamsBoard', function () {
    this.render('teamsBoard');
});

Router.route('/socialFeed', function () {
    this.render('socialFeed');
});

Router.route('/clients', function () {
    this.render('clients');
});

Router.route('/fullHeight', function () {
    this.render('fullHeight');
});

Router.route('/offCanvas', function () {
    this.render('offCanvas');
});

Router.route('/voteList', function () {
    this.render('voteList');
});

Router.route('/fileManager', function () {
    this.render('fileManager');
});

Router.route('/calendar', function () {
    this.render('calendar');
});

Router.route('/issueTracker', function () {
    this.render('issueTracker');
});

Router.route('/blog', function () {
    this.render('blog');
});

Router.route('/article', function () {
    this.render('article');
});

Router.route('/faq', function () {
    this.render('faq');
});

Router.route('/timelineOne', function () {
    this.render('timelineOne');
});

Router.route('/pinBoard', function () {
    this.render('pinBoard');
});

//
// Other pages
//

Router.route('/searchResult', function () {
    this.render('searchResult');
});

Router.route('/lockScreen', function () {
    this.render('lockScreen');
    this.layout('blankLayout')
});

Router.route('/invoice', function () {
    this.render('invoice');
});

Router.route('/invoicePrint', function () {
    this.render('invoicePrint');
    this.layout('blankLayout')
});

Router.route('/login', function () {
    this.render('login');
    this.layout('blankLayout')
});

Router.route('/loginTwo', function () {
    this.render('loginTwo');
    this.layout('blankLayout')
});

Router.route('/forgotPassword', function () {
    this.render('forgotPassword');
    this.layout('blankLayout')
});

Router.route('/register', function () {
    this.render('register');
    this.layout('blankLayout')
});

Router.route('/errorOne', function () {
    this.render('errorOne');
    this.layout('blankLayout')
});

Router.route('/errorTwo', function () {
    this.render('errorTwo');
    this.layout('blankLayout')
});

Router.route('/emptyPage', function () {
    this.render('emptyPage');
});

//
// Miscellaneous
//

Router.route('/toastrNotification', function () {
    this.render('toastrNotification');
});

Router.route('/nestableList', function () {
    this.render('nestableList');
});

Router.route('/agileBoard', function () {
    this.render('agileBoard');
});

Router.route('/timelineTwo', function () {
    this.render('timelineTwo');
});

Router.route('/diff', function () {
    this.render('diff');
});

Router.route('/sweetAlert', function () {
    this.render('sweetAlert');
});

Router.route('/idleTimer', function () {
    this.render('idleTimer');
});

Router.route('/spinners', function () {
    this.render('spinners');
});

Router.route('/liveFavicon', function () {
    this.render('liveFavicon');
});

Router.route('/googleMaps', function () {
    this.render('googleMaps');
});

Router.route('/codeEditor', function () {
    this.render('codeEditor');
});

Router.route('/modalWindow', function () {
    this.render('modalWindow');
});

Router.route('/forumView', function () {
    this.render('forumView');
});

Router.route('/forumDetail', function () {
    this.render('forumDetail');
});

Router.route('/validation', function () {
    this.render('validation');
});

Router.route('/treeView', function () {
    this.render('treeView');
});

Router.route('/chatView', function () {
    this.render('chatView');
});

Router.route('/masonry', function () {
    this.render('masonry');
});

//
// UI Elements
//

Router.route('/typography', function () {
    this.render('typography');
});

Router.route('/icons', function () {
    this.render('icons');
});

Router.route('/draggablePanels', function () {
    this.render('draggablePanels');
});

Router.route('/buttons', function () {
    this.render('buttons');
});

Router.route('/video', function () {
    this.render('video');
});

Router.route('/tabsPanels', function () {
    this.render('tabsPanels');
});

Router.route('/tabs', function () {
    this.render('tabs');
});

Router.route('/notifications', function () {
    this.render('notifications');
});

Router.route('/badgesLabels', function () {
    this.render('badgesLabels');
});

//
// Grid Options
//

Router.route('/gridOptions', function () {
    this.render('gridOptions');
});

//
// Tables
//

Router.route('/tableStatic', function () {
    this.render('tableStatic');
});

Router.route('/dataTables', function () {
    this.render('dataTables');
});

Router.route('/fooTables', function () {
    this.render('fooTables');
});

//
// E-commerce
//

Router.route('/productsGrid', function () {
    this.render('productsGrid');
});

Router.route('/productsList', function () {
    this.render('productsList');
});

Router.route('/productEdit', function () {
    this.render('productEdit');
});

Router.route('/orders', function () {
    this.render('orders');
});

Router.route('/productDetail', function () {
    this.render('productDetail');
});

Router.route('/payments', function () {
    this.render('payments');
});

//
// Gallery
//

Router.route('/gallery', function () {
    this.render('gallery');
});

Router.route('/carusela', function () {
    this.render('carusela');
});

Router.route('/slick', function () {
    this.render('slick');
});


//
// CSS Animations
//

Router.route('/cssAnimations', function () {
    this.render('cssAnimations');
});

//
// Landing page
//

Router.route('/landing', function () {
    this.render('landing');
    this.layout('blankLayout')
});

//
// Other pages routes
//
Router.route('/notFound', function () {
    this.render('notFound');
});

// Default route
Router.route('/', function () {
  Router.go('LandingPage',{data: 'testPage'});
});

Router.route('/imaginator', function () {
    this.render('dashboard1');
});
