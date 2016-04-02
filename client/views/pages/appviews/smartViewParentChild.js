SmartChildren = new Mongo.Collection('smartChildren');
Session.setDefault('svSelectedKey', null);
Session.setDefault('svSelectedHeader', null);
Session.setDefault('svParentChanged', false);
Session.setDefault('svContentChanged', false);
Session.setDefault('svAddEditOne', null);
Session.setDefault('svMainDataId',null);
Session.setDefault('svActiveTab',null);
Session.setDefault('svSmartModalReady',null);

Template.viewSmartParentChild.onCreated (function(){

});

Template.viewSmartParentChild.rendered = function () {
    var self = this;
    // Add slimscroll to element
    Session.set('svAddEditOne', null);
    $('.full-height-scroll').slimscroll({
        height: '100%'
    })
    //console.log(self.data);
    // Initialize dataTables
    var x = $('#dtParent').DataTable({
        dom: getDom(),
        buttons : getButtons(),
        columns : self.data.columns,
        data: self.data.data,
        paging: self.data.smartView.parentPaging
    });

    function getDom () {
      var r = 'rt';
      if (self.data.smartView.parentAdd == true) r = r + 'B';
      //console.log(r);
      return r;
    }

    function getButtons() {
      var r = [];
      if (self.data.smartView.parentAdd == true) {
        x = {
            text: '<button type="button" class="btn btn-success btn-sm" data-toggle="modal" data-backdrop="static" data-target="#smartEditModal" value="add"><i class="fa fa-plus">&nbsp;Add new</button>',
            className: '',
            action: function ( e, dt, node, config ) {
              //console.log(current);
              Session.set('svAddEditOne', {collectionId: self.data.name, key: null, isEdit: false, collectionGroup: '', collectionKey: self.data.key});
            }

        };
        r.push(x);
      }
      return r;
    }
};

Template.viewSmartParentChild.events ({
  'click #dtParent tr': function(event){
    //console.log(event);
    var x = $('#dtParent').DataTable();
    var data = x.row($(event.currentTarget)).data();
    Session.set('svSelectedKey', data.key);
    Session.set('svSelectedHeader', data.header);
    //console.log(data);
    if ( $(event.currentTarget).hasClass('active') ) {
        $(event.currentTarget).removeClass('active');
    }
    else {
        x.$('tr.active').removeClass('active');
        $(event.currentTarget).addClass('active');
    }
  },
  'click a.parentTab': function(event){
    var group = $(event.currentTarget).context.innerText;
    var x = $('#dtParent').DataTable();
    var data = Template.currentData();
    group = $.fn.dataTable.util.escapeRegex(group.trim());
    if (group === 'All' || group === '') x.column(data.groupColumn+':name').search('').draw();
    else if (group === 'Blank') x.column(data.groupColumn+':name').search('...').draw();
    else  x.column(data.groupColumn+':name').search('^' + group + '$',true,false).draw();
  },
  'click #dtParent button': function(event) {
    var btn = $(event.currentTarget).context;
    var current = Template.currentData();
    //console.log(current);
    var x = $('#dtParent').DataTable();
    var data = x.row( $(btn).parents('tr') ).data();
    //console.log(current);
    var type = btn.value;
    //console.log(type);
    if(type==='edit') {
      //console.log({collectionId: current.collection._id, key: data.key, isEdit: true});
      Session.set('svAddEditOne', {collectionId: current.name, key: data.key, isEdit: true}); }
    else if (type==='detail') Router.go('DetailSmartParentChild',{collection: current.name}, {query: data.key});
    else {
      swal({
          title: "You are about to delete this record!",
          text: "You will not be able to recover the data!",
          type: "warning",
          showCancelButton: true,
          cancelButtonText: "No, go back",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, go ahead!",
          closeOnConfirm: true
      }, function () {
          //console.log(self.data.name);
          Session.set('svContentChanged', false);
          var main = Session.get('svMainDataId');
          if(current.collectionId!=main) Session.set('svActiveTab',current.collectionId);
          Meteor.call('deleteItem',current.collectionId,data.key,current.collectionGroup, function(error, result){
            if(error) console.log(error); //must stil do error message thing
            else {
              //console.log(result);
              //must still do modal close and template refresh
              //close modal
              $('#smartEditModal').modal('hide');
              Session.set('svContentChanged', true);
              //refresh template
            }
          });
      });
    }
  }
});

Template.viewSmartParentChild.helpers({
  groupsClass: function(){
    var data = Template.currentData();
    if(data.showGroups) return "tabs-container";
    else return "";
  },
  isActive: function(data){
    if(data==='All') return "active"
    else return "";
  },
  hasData: function(){
    return Session.equals("svSelectedKey", null) ? false : true;
  },
  childWidth: function(){
    var data = Template.currentData();
    return 12 - data.smartView.parentWidth;
  },
  tabPosition: function(){
    var data = Template.currentData();
    if(data.smartView.parentTabPosition === 'LFT') return 'tabs-left';
    else return 'tabs-top';
  },
  hasHeader: function(){
    var data = Template.currentData();
    if(data.smartView.parentHeaders == true) return '';
    else return 'table-no-header';
  },
  childIsCollapse: function(){
    var data = Template.currentData().smartView.childDetailType;
    return data == 'CLPS'? true : false;
  },
  childIsTab: function(){
    var data = Template.currentData().smartView.childDetailType;
    //console.log(data);
    return data == 'TABS'? true : false;
  },
  getHeader: function() {
    return Session.get('svSelectedHeader');
  }

});

Template.viewSmartChildren.onCreated (function () {
  var self = this;
  self.autorun (function () {
    var subscription = self.subscribe('ViewSmartChildren', self.data.name, Session.get('svSelectedKey'));
    if (subscription.ready()) {
      //console.log("> Ready. \n\n")
    } else {
      //console.log("> Subscription is not ready yet. \n\n");
    }
  });
  self.children = function () {
    var res = SmartChildren.find().fetch();
    //console.log(res);
    if(res.length === 0) return [];
    else return res[0].data;
  };
});

Template.viewSmartChildren.helpers({
  getChildData: function(){
    //console.log(Template.instance().children());
    return Template.instance().children();
  }
});

Template.viewSmartList.rendered = function () {
  var self = this;

    var t = $('#tbl_'+ self.data.collectionId);
    t.DataTable({
        "dom": 'rt',
        columns : self.data.columns,
        data: self.data.list,
        paging: false,
        retrieve: true
    });
};

Template.viewSmartTabs.onCreated (function () {
  var self = this;
  self.autorun (function () {
    var subscription = self.subscribe('ViewSmartChildren', self.data.name, Session.get('svSelectedKey'));
    if (subscription.ready()) {
      //console.log("> viewSmartTabs Ready. \n\n");
      Session.set('svContentChanged', true);
    } else {
      //console.log("> viewSmartTabs Subscription is not ready yet. \n\n");
      Session.set('svContentChanged', false);
    }
  });
  self.children = function () {
    //alert(Session.get('selectedKey'));
    var res = SmartChildren.find().fetch();
    //console.log(res);
    if(res.length === 0) return [];
    else return res[0].data;
  };
});

Template.viewSmartTabs.helpers({
  parentChanged: function() {
    var x = Session.get('svParentChanged');
    //if(x==true) console.log('Changed');
    return x;
    //Session.set('svParentChanged',false);
  },
  getChildData: function(){
    //console.log(Template.instance().children());
    return Template.instance().children();
  },
  isActive: function(data){
    var x = Session.get('svActiveTab');
    //console.log(x);
    if(x==null) {
      Session.set('svActiveTab',data);
      return 'active';
    }
    else if(x===data) return 'active';
    else return null;
  },
  getTemplate: function(){
    //console.log(this.smartChildType);
    if (this.smartChildType==='SCT') return 'viewSmartCrudTable';
  },
  contentChanged: function() {
    var x = Session.get('svContentChanged');
    //if(x==true) console.log('Changed');
    return x;
    //Session.set('svContentChanged',false);
  }
});

Template.viewSmartCrudTable.rendered = function() {
  var self = this;
  //console.log('rendered');
  // Add slimscroll to element
  $('.full-height-scroll').slimscroll({
      height: '100%'
  })

  //console.log(self.data);
  // Initialize dataTables
};

Template.viewSmartCrudTable.onCreated (function () {
  var self = this;
  var current = Template.currentData();
  self.autorun (function () {
      var subscription = self.subscribe('DetailAllSmartChild', self.data.collectionId, self.data.key, 'SA', self.data.collectionGroup);
  });

  self.loadData = function(){
    var res = DetailAllSmartChild.find({_id: self.data.collectionId}).fetch();
    //console.log({loadData:res});
    if(res.length!=0) {
        res = res[0];

      //console.log(res.data);
      var t = $('#tbl_'+ self.data.collectionId);
      t.DataTable({
          "dom": 'rtB',
          buttons: [
            {
              text: '<button type="button" class="btn btn-success btn-sm" data-toggle="modal" data-backdrop="static" data-target="#smartEditModal" value="add"><i class="fa fa-plus">&nbsp;Add new</button>',
              className: '',
              action: function ( e, dt, node, config ) {
                //console.log(current);
                Session.set('svAddEditOne', {collectionId: current.collectionId, key: null, isEdit: false, collectionGroup: current.collectionGroup, collectionKey: current.key});
              }
            }
          ],
          columns : res.columns,
          data: res.data?res.data:[],
          paging: false,
          retrieve: true
      });
      return res;
    }
  }
});


Template.viewSmartCrudTable.events({
  'click .tbl-button, button': function(event) {
    var btn = $(event.currentTarget).context;
    var current = Template.currentData();
    //console.log(current);
    var x = $('#tbl_'+current.collectionId).DataTable();
    var data = x.row( $(btn).parents('tr') ).data();
      //console.log(data);
      var type = btn.value;
      //console.log(type);
      if(type==='edit') {
        //console.log({test:'crud',collectionId: current.collectionId, key: data.key, isEdit: true});
        Session.set('svAddEditOne', {collectionId: current.collectionId, key: data.key, isEdit: true});
      }
      else {
        swal({
            title: "You are about to delete this record!",
            text: "You will not be able to recover the data!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "No, go back",
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, go ahead!",
            closeOnConfirm: true
        }, function () {
            //console.log(self.data.name);
            Session.set('svContentChanged', false);
            var main = Session.get('svMainDataId');
            if(current.collectionId!=main) Session.set('svActiveTab',current.collectionId);
            Meteor.call('deleteItem',current.collectionId,data.key,current.collectionGroup, function(error, result){
              if(error) console.log(error); //must stil do error message thing
              else {
                //console.log(result);
                //must still do modal close and template refresh
                //close modal
                $('#smartEditModal').modal('hide');
                Session.set('svContentChanged', true);
                //refresh template
              }
            });
        });
      }
  },
  'click a.crudTab': function(event){
    var data = Template.instance().loadData();
    var group = $(event.currentTarget).context.innerText;
    var current = Template.currentData();
    var x = $('#tbl_'+current.collectionId).DataTable();
    var data = Template.instance().loadData();
    group = group.trim();
    //console.log(new RegExp(group + '$'));
    if (group === 'All' || group === '') x.column(data.groupColumn+':name').search('').draw();
    else if (group === 'Blank') x.column(data.groupColumn+':name').search('...').draw();
    else  x.column(data.groupColumn+':name').search(new RegExp(group + '$'),true).draw();
  }
});



Template.viewSmartCrudTable.helpers({
  parentChanged: function() {
    var x = Session.get('svParentChanged');
    //if(x==true) console.log('Changed');
    return x;
  },
  getData: function(){
    if(!Template.instance().loadedData)
      Template.instance().loadedData = Template.instance().loadData();
    return '';
  },
  loadData: function(){
    if(!Template.instance().loadedData)
      Template.instance().loadedData = Template.instance().loadData();
    return Template.instance().loadedData;
  },
  groupsClass: function(showGroups){
    if(showGroups) return "tabs-container";
    else return "";
  },
  showGroups: function(showGroups){
    if(showGroups===true) return true;
    else return false;
  },
  isActive: function(data){
    if(data==='All') return "active"
    else return "";
  }
});

Template.viewSmartAddEditModal.rendered = function() {

};

Template.viewSmartAddEditModal.onCreated (function () {
  var self = this;
  self.autorun (function () {
    //console.log(self.data.collectionId);
    //console.log(Session.get('addEditOne'));
    var params = Session.get('svAddEditOne');
    //console.log({test:'crud',params:params});
    if (params != null) {
      //console.log({test:'crud',params:params});
      var subscription = self.subscribe('addEditOne', params.collectionId, params.isEdit, params.key, params.collectionGroup, params.collectionKey );
      Session.set('svSmartModalReady',subscription.ready());
      //console.log(Session.get('smartModalReady'));
    }
  });
  self.addEdit = function () {
    //console.log({test:'crud',isready:Session.get('svSmartModalReady')});
    if(Session.get('svSmartModalReady')===true) {
      var res = AddEditOne.find().fetch();//{_id: params.collectionId}).fetch();
      //console.log({test:'test',res: res});
      if(res.length === 0) return [];
      else {
        res = res[0];
        var f = $("#form");
        f.validate({
          rules: res.rules
      });
        return res;
    }
  };
  };
});

Template.viewSmartAddEditModal.events({
  'submit #form': function(event) {
    var f = $("#form");
    var isvalidate=f.valid();
    var res = Template.instance().addEdit();
    if(isvalidate) {
    event.preventDefault();
    var form = {};
    //$.each($('form input:checkbox'), function() {
      //console.log(this);
      //this.value = this.selected ? 'true' : '';
    //});
    $("form input:checkbox").each(function(){
      if(this.checked) this.value = '1';
      else {
        this.checked = true;
        this.value = '0'
      }
    });
    $.each($(f).serializeArray(), function() {
         form[this.name] = this.value;
     });
     //console.log($(f));
     //console.log(res);
     var main = Session.get('svMainDataId');
     if(res.id!=main) Session.set('svActiveTab',res.id);
     if(!res.isEdit) {
       Session.set('svContentChanged', false);
       Meteor.call('addItem',res.id,form,res.collectionGroup, function(error, result){
         if(error) console.log(error); //must stil do error message thing
         else {
           //console.log(result);
           //must still do modal close and template refresh
           //close modal
           $('#smartEditModal').modal('hide');
           Session.set('svContentChanged', true);

           //refresh template
         }
       });
     } else {
       Session.set('svContentChanged', false);
       Meteor.call('updateItem',res.id,form,res.collectionGroup, function(error, result){
         if(error) console.log(error); //must stil do error message thing
         else {
           //console.log(result);
           //must still do modal close and template refresh
           //close modal
           $('#smartEditModal').modal('hide');
           Session.set('svContentChanged', true);
           //refresh template
         }
       });
     }
   }
  }
});

Template.viewSmartAddEditModal.helpers({
  getAddEdit: function(){
    //console.log(Template.instance().addEdit());
    return Template.instance().addEdit();
  },
  getAction: function() {
    var data = Template.instance().addEdit();
    //console.log(data);
    //console.log('/DetailSmartParentChild/update:'+data.isEdit+'/' + data.id + '/' + data.collectionGroup);
    if(!data) return '';
    if(data.isEdit) return '/DetailSmartParentChild/update/' + data.id + '/' + data.collectionGroup;
    else return '/DetailSmartParentChild/add/' + data.id + '/' + data.collectionGroup;
  },
  hiddenKeys: function() {
    var data = Template.instance().addEdit();
    if(!data) return '';
    if(data.keys) {
      var ret = "";
      var keys = _.keys(data.keys);
      _.each(keys, function(i){
        ret += '<input name="'+i+'" type="hidden" value="'+ data.keys[i] +'">'
      });
      return ret;
    }
    else return '';
  }
});
