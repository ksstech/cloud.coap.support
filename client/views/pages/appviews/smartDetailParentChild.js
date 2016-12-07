Session.setDefault('contentChanged', true);
Session.setDefault('activeTab','');
Session.setDefault('mainDataId',null);

Template.detailSmartParentChild.onCreated(function(){
  var self = this;
  self.autorun (function() {
    //detailSmartParentChild
  });
});

Template.detailSmartParentChild.helpers({
  isActive: function(data){
    var x = Session.get('activeTab')
    //console.log(x);
    if(x=='') {
      Session.set('activeTab',data);
      return 'active';
    }
    else if(x===data) return 'active';
    else return '';
  },
  getTemplate: function(){
    //console.log(this.smartChildType);
    if (this.smartChildType==='SCT') return 'smartCrudTable';
  },
  contentChanged: function() {
    var x = Session.get('contentChanged');
    return x;
  }
});

Template.smartMainData.events ({
  'click button': function (event) {
      var btn = $(event.currentTarget).context;
      var data = Template.currentData().data;
      Session.set('mainDataId',data.collectionId);
      if(btn.value==='back') Router.go('ViewSmartParentChild',{collection: data.collectionId});
      else if(btn.value==='edit') Session.set('addEditOne', {collectionId: data.collectionId, key: data.mainData.key, isEdit: true});
    },

});



DetailAllSmartChild = new Mongo.Collection("detailAllSmartChild");
Template.smartCrudTable.rendered = function() {
  var self = this;
  //console.log('rendered');
  // Add slimscroll to element
  $('.full-height-scroll').slimscroll({
      height: '100%'
  })

  //console.log(self.data);
  // Initialize dataTables
};

Template.smartCrudTable.onCreated (function () {
  var self = this;
  var current = Template.currentData();
  self.autorun (function () {
      var subscription = self.subscribe('DetailAllSmartChild', self.data.collectionId, self.data.key, 'SA', self.data.collectionGroup);
  });

  self.loadData = function(){
    var res = DetailAllSmartChild.find({_id: self.data.collectionId}).fetch();

    if(res.length!=0) {
      res = res[0];
    }
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
              Session.set('addEditOne', {collectionId: current.collectionId, key: null, isEdit: false, collectionGroup: current.collectionGroup, collectionKey: current.key});
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
});


Template.smartCrudTable.events({
  'click .tbl-button, button': function(event) {
    var btn = $(event.currentTarget).context;
    var current = Template.currentData();
    //console.log(current);
    var x = $('#tbl_'+current.collectionId).DataTable();
    var data = x.row( $(btn).parents('tr') ).data();
      //console.log(data);
      var type = btn.value;
      //console.log(type);
      if(type==='edit') {Session.set('addEditOne', {collectionId: current.collectionId, key: data.key, isEdit: true}); }
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
            Session.set('contentChanged', false);
            var main = Session.get('mainDataId');
            if(current.collectionId!=main) Session.set('activeTab',current.collectionId);
            Meteor.call('deleteItem',current.collectionId,data.key,current.collectionGroup, function(error, result){
              if(error) console.log(error); //must stil do error message thing
              else {
                //console.log(result);
                //must still do modal close and template refresh
                //close modal
                $('#smartEditModal').modal('hide');
                Session.set('contentChanged', true);
                //refresh template
              }
            });
        });
      }
  },
  'click a.tab': function(event){
    var data = Template.instance().loadData();
    var group = $(event.currentTarget).context.innerText;
    var current = Template.currentData();
    var x = $('#tbl_'+current.collectionId).DataTable();
    var data = Template.instance().loadData();
    group = group.trim();

    if (group === 'All' || group === '') x.column(data.groupColumn+':name').search('').draw();
    else if (group === 'Blank') x.column(data.groupColumn+':name').search('...').draw();
    else  x.column(data.groupColumn+':name').search(group).draw();
  }
});



Template.smartCrudTable.helpers({
  loadData: function(){
    var data = Template.instance().loadData();
    //console.log(data);
    return data;
  },
  groupsClass: function(){
    var data = Template.instance().loadData();
    if(data.showGroups) return "tabs-container";
    else return "";
  },
  showGroups: function(){
    var data = Template.instance().loadData();
    //console.log(data);
    if(data.showGroups===true) return true;
    else return false;
  },
  isActive: function(data){
    if(data==='All') return "active"
    else return "";
  }
})


Template.detailSmartAddEditModal.rendered = function() {

};

Template.detailSmartAddEditModal.onCreated (function () {
  var self = this;
  self.autorun (function () {
    //console.log(self.data.collectionId);
    //console.log(Session.get('addEditOne'));
    var params = Session.get('addEditOne');

    if (params != null) {
      var subscription = self.subscribe('addEditOne', params.collectionId, params.isEdit, params.key, params.collectionGroup, params.collectionKey );
      Session.set('smartModalReady',subscription.ready());
      //console.log(Session.get('smartModalReady'));
    }
  });
  self.addEdit = function () {
    if(Session.get('smartModalReady')===true) {
      var res = AddEditOne.find().fetch();//{_id: params.collectionId}).fetch();
      //console.log({test:'test2',res: res});
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

Template.detailSmartAddEditModal.events({
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
     var main = Session.get('mainDataId');
     if(res.id!=main) Session.set('activeTab',res.id);
     if(!res.isEdit) {
       Session.set('contentChanged', false);
       Meteor.call('addItem',res.id,form,res.collectionGroup, function(error, result){
         if(error) console.log(error); //must stil do error message thing
         else {
           //console.log(result);
           //must still do modal close and template refresh
           //close modal
           $('#smartEditModal').modal('hide');
           Session.set('contentChanged', true);

           //refresh template
         }
       });
     } else {
       Session.set('contentChanged', false);
       Meteor.call('updateItem',res.id,form,res.collectionGroup, function(error, result){
         if(error) console.log(error); //must stil do error message thing
         else {
           //console.log(result);
           //must still do modal close and template refresh
           //close modal
           $('#smartEditModal').modal('hide');
           Session.set('contentChanged', true);
           //refresh template
         }
       });
     }
   }
  }
});

Template.detailSmartAddEditModal.helpers({
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
