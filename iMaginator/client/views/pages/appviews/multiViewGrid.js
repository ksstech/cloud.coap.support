Template.multiCrudView.helpers({
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
