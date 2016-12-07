Meteor.methods({
  addItem: function(collectionId, data, collectionGroup) {
    this.unblock();
    //try {

      data = IMAG.RemoveEmpties(data);
      //console.log({addITem: {collection: collectionId, data: data, collectionGroup: collectionGroup}});
      var collectionItem = IMAG.getCollection(collectionId);
      var sourceName = IMAG.GetCollectionSourceName(collectionItem.collectionSource);
      if(sourceName === 'Internal') {
        var col = global[collectionItem.name];
        //console.log(data);
        col.insert(data);
        return;
      } else if (sourceName === 'DSS_IMACS'){
        var url = Meteor.settings[sourceName];
        var fnc = IMAG.getDSSFunction(collectionId,'AO',collectionGroup);

        var queryString = IMAG.ObjToQueryString(data);
        var options = {headers:{"Accept":"application/json"}, query: queryString};
        url +=  fnc;
        console.log(url+'?'+queryString);
        //console.log(options);
        var data = HTTP.get(url, options);
        if (!data.data) return [];
        if(!data.data.Entries) return [];
        if(!data.data.Entries.Entry) return [];
        data = data.data.Entries.Entry;
        //console.log(data);
        return data;
      }
    // } catch (e) {
    //   var err = {error: {location: 'addItem', details: e}};
    //   console.log(EJSON.stringify(err, {indent: true}));
    //   return err;
    // }
  },
  updateItem: function(collectionId, data, collectionGroup) {
    this.unblock();
    // try {
    //console.log(data);
      var collectionItem = IMAG.getCollection(collectionId);
      var sourceName = IMAG.GetCollectionSourceName(collectionItem.collectionSource);
      if(sourceName === 'Internal') {
        var col = global[collectionItem.name];
        var defs = DataDefinition.find({collection: collectionId, isPrimary: true}).fetch();
        var keys = {};
        _.each(defs, function(item){
          keys[item.columnName] = data[item.columnName];
          delete data[item.columnName];
        });
        //console.log({intUpdate:{keys: keys, data: data}});
        col.upsert(keys, {$set: data}, function(x,y){
          console.log(x);
        });
      } else if (sourceName === 'DSS_IMACS'){
        //check for empty Data
        _.each(_.keys(data),function(i){
          if(data[i]==='') delete data[i];
        });
        //console.log({updateITem: {collection: collectionId, collectionFunction: 'UO', collectionGroup: collectionGroup}});
        var fnc = IMAG.getDSSFunction(collectionId,'UO',collectionGroup);
        var queryString = IMAG.ObjToQueryString(data);
        var url = Meteor.settings[sourceName] + fnc;
        console.log(url+'?'+queryString);
        var options = {headers:{"Accept":"application/json"}, query: queryString};
        //console.log({url: url, options: options});
        var targetResult = HTTP.get(url, options);
      }
      return;
    // } catch (e) {
    //   var err = {error: {location: 'updateItem', details: e}};
    //   console.log(err);
    //   return err;
    // }
  },
  deleteItem: function(collectionId, data, collectionGroup) {
    this.unblock();
    // try {
      var collectionItem = IMAG.getCollection(collectionId);
      var sourceName = IMAG.GetCollectionSourceName(collectionItem.collectionSource);
      if(sourceName === 'Internal') {
        var col = global[collectionItem.name];
        //console.log(data);
        col.remove(data, function(x,y){
          if(x) console.log(x);
        });
      } else if (sourceName === 'DSS_IMACS'){
        //console.log({deleteItem: {collection: collectionId, data: data, collectionFunction: 'DO', collectionGroup: collectionGroup}});
        var fnc = IMAG.getDSSFunction(collectionId,'DO',collectionGroup);
        var queryString = IMAG.ObjToQueryString(data);
        var url = Meteor.settings[sourceName] + fnc;
        console.log(url);
        var options = {headers:{"Accept":"application/json"}, query: queryString};
        //console.log({url: url, options: options});
        var targetResult = HTTP.get(url, options);
        //console.log(targetResult);
      }
      return;
    // } catch (e) {
    //   var err = {error: {location: 'deleteItem', details: e}};
    //   console.log(EJSON.stringify(err, {indent: true}));
    //   return err;
    // }
  }
});
