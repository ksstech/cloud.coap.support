Template.siteBuilderDataTypeSimpleDropDown.rendered = function(){
  var self = this;
    $(".select2").select2({
        placeholder: "Select a value",
        allowClear: true
    });
}

Template.siteBuilderDataTypeSimpleDropDown.events({
  'select2-opening .select2': function(event){
    var target = event.target;
    var data = Template.currentData();
    if(data.filterColumn) {
      var filterValue = document.getElementsByName(data.filterColumn);
      filtervalue = filterValue[0].value
      var $select = $('#'+target.name);
      $select.html('');
      data.lookupData.forEach(function(item){
        if(item.filter === filtervalue)
          if(data.data === item.id) {$select.append('<option value="'+item.name+'" selected >'+item.name+'</option>');}
          else {$select.append('<option value="'+item.name+'">'+item.name+'</option>');}
      });
    }
  }
});

Template.siteBuilderDataTypeSimpleDropDown.helpers({
  isSelected: function(id, data) {
    var ret = '';
    if(data.data) {
      if (data.data === id) {
        ret = 'selected';
      }
      else ret = ''
    } else ret = '';
    return ret;
  },
});

Template.siteBuilderDataTypePlainDropDown.helpers({
  isSelected: function(id, data) {
    var ret = '';
    if(data.data) {
      if (data.data === id) {
        ret = 'selected';
      }
      else ret = ''
    } else ret = '';
    return ret;
  },
});

Template.siteBuilderDataTypePlainDropDown.events({
  'mousedown, keydown select': function(event){
    //console.log('yo');
    var target = event.target;
    var data = Template.currentData();
    if(data.filterColumn) {
      var filterValue = document.getElementsByName(data.filterColumn);
      filtervalue = filterValue[0].value
      var $select = $('#'+target.name);
      $select.html('');
      //console.log(data);
      if(data.required === false ) {$select.append('<option value="" selected >[No Selection]</option>');}
      data.lookupData.forEach(function(item){
        if(item.filter === filtervalue)
          if(data.data === item.id) {$select.append('<option value="'+item.name+'" selected >'+item.name+'</option>');}
          else {$select.append('<option value="'+item.name+'">'+item.name+'</option>');}
      });
    }
  }
});

Template.siteBuilderDataTypeBoolean.rendered = function(){
  // Initialize i-check plugin
  $('.i-checks').iCheck({
      checkboxClass: 'icheckbox_square-green',
      radioClass: 'iradio_square-green'
  });
}

Template.siteBuilderDataTypeBoolean.events({

});
Template.siteBuilderDataTypeBoolean.helpers({
  isChecked: function(data) {
    var ret = '';
    if(data) {
      if (data === true || data == '1') {
        ret = 'checked';
      }
      else ret = ''
    } else ret = '';
    return ret;
  }
});

Template.siteBuilderDataTypeIconLookup.rendered = function(){
  var self = this;
  function format(state) {
    if (!state.id) return state.text; // optgroup
    return '<i class="fa '+ state.id + '"></i> ' + state.id;
  }
  $("#iconsSelect").select2({
    placeholder: "Select a value",
    allowClear: true,
      formatResult: format,
      formatSelection: format,
      escapeMarkup: function(m) { return m; }
  });
}

Template.siteBuilderDataTypeText.rendered = function(){
  var self = this;
  //console.log(self.data);
}

Template.iconLookup.helpers({
  isSelected: function(id, data) {
    var ret = '';
    if(data.data.data) {
      if (data.data.data === id) {
        ret = 'selected';
      }
      else ret = ''
    } else ret = '';
    return ret;
  }
});
