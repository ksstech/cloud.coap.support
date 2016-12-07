Template.ViewAllCrud.rendered = function(){
  var self = this;
    if(self.data.error){
      swal({
          title: "Something went wrong!",
          text: self.data.error,
          type: "error",
          //showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Ok"
      }, function () {
          Router.go('/imaginator');
      });
    }
    // Initialize dataTables
    var x = $('#dataTablesX').DataTable({
        stateSave: true,
        "dom": 'Blfrtip',
        buttons: [
          {
            text: '<i class="fa fa-plus">&nbsp;Add new',
            className: 'btn btn-success btn-sm',
            action: function ( e, dt, node, config ) {
              Router.go('Crud/add',{collection: self.data.name});
            }
          }
        ],
        columns : self.data.columns,
        data: self.data.data
    });

    $('#dataTablesX tbody').on( 'click', 'button', function () {
        var data = x.row( $(this).parents('tr') ).data();
        //console.log(data);
        var type = this.value;
        if(type==='edit') Router.go('Crud/edit',{collection: self.data.name}, {query: data.key});
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
              Router.go('Crud/delete',{collection: self.data.name}, {query: data.key});
          });
        }
    } );


    $('#dataTablesX tbody').on('click', 'td.details-control', function () {
      var data = x.row( $(this).parents('tr') ).data();
      var tr = $(this).closest('tr');
      var i = $(this).children('i');
      var row = x.row( tr );

      if ( row.child.isShown() ) {
          // This row is already open - close it
          row.child.hide();
          i.removeClass('open');
          i.addClass('closed');
          i.addClass('fa-plus-square-o');
          i.removeClass('fa-minus-square-o');
      }
      else {
          // Open this row
          row.child( format(data.hidden)).show();
          //console.log(tr);
          i.removeClass('closed');
          i.addClass('open');
          i.removeClass('fa-plus-square-o');
          i.addClass('fa-minus-square-o');
      }
    });

    $('a.tab').on('click', function(){

      var group = $(this).context.innerText;
      group = group.trim();
      if (group === 'All' || group === '') x.column(self.data.groupColumn+':name').search('').draw();
      else if (group === 'Blank') x.column(self.data.groupColumn+':name').search('...').draw();
      else  x.column(self.data.groupColumn+':name').search(group + '$',true).draw();
    })

};

Template.ViewAllCrud.created = function(){
  var self = this;

}

Template.ViewAllCrud.helpers({
  groupsClass: function(){
    var data = Template.currentData();
    if(data.showGroups) return "tabs-container";
    else return "";
  },
  isActive: function(data){
    if(data==='All') return "active"
    else return "";
  }
});

function format ( d ) {
    // `d` is the original hidden data object for the row
    var html = '<div class="col-md-6"><table cellpadding="5" class="table table-bordered" cellspacing="0" border="0" style="padding-left:50px;"><tbody>';
    d.forEach(function(item){
      html += '<tr><th class="col-md-3" align="right">'+item.label+':</th><td class="col-md-3">'+item.value+'</td></tr>';
    });
    html+= '</tbody></table></div>';
    return html;
}
