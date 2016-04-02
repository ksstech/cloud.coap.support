
Template.siteBuilderAddEdit.rendered = function() {
  var self = this;
  if(self.data.error){
    swal({
        title: "Something went wrong!",
        text: EJSON.stringify(self.data.error, {indent: true}),
        type: "error",
        //showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Ok"
    }, function () {
        Router.go('/admin');
    });
  };
  $("#form").validate({

    rules: self.data.rules,
    submitHandler: function() {
      swal({
          title: "You are about to save data.",
          type: "info",
          showCancelButton: true,
          cancelButtonText: "No, go back",
          confirmButtonText: "Yes, go ahead!",
          closeOnConfirm: true
      }, function () {
          form.submit();
      });
    }
  });
};

Template.siteBuilderAddEdit.events({
  'click .cancel' : function(event, template){
          Router.go('ViewAllCrud',{collection: template.data.id});
  },
});

Template.siteBuilderAddEdit.helpers({
  astirisk: function(){
    var data = Template.currentData();
    if(data.required) return "*";
    else return "";
  },
  getAction: function() {
    var data = Template.currentData();
    if(data.isEdit) return '/Crud/update/' + data.id;
    else return '/Crud/addnew/' + data.id;
  }

});
