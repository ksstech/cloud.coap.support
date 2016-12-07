Meteor.methods({
  crudView: function(table, user){
    var self = this;
    try {
      var urlTableMeta = Meteor.settings.wso2dss.url + Meteor.settings.wso2dss.imaginTableMeta + 'opt_' + table;
      var meta = HTTP.get(urlTableMeta,{headers:{"Accept":"application/json"}});
      if(!meta.data.entries.entry) throw urlTableMeta + ": returned unusable data";
      var urlTableData = Meteor.settings.wso2dss.url + Meteor.settings.wso2dss.imaginTableData + 'opt_get_all_' + table;
      var data = HTTP.get(urlTableData,{headers:{"Accept":"application/json"}});
      if(!data.data.entries.entry) throw urlTableData + ": returned unusable data";
      meta = meta.data.entries.entry;
      data = data.data.entries.entry;
      console.log(meta);


      /*if(result.data.entries.entry) {
        result = buildMenu(result.data.entries.entry,'0');
        _.each(result, function(item){
          self.added('menuItems', Random.id(), item);
        });
        self.ready();
      } else {
        console.log('No menuItems');
      }*/
      return (meta);
    } catch (err) {
      console.log(err);
      return err;
    }
  }
});
