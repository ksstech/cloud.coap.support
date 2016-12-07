'use strict'
var config = require('../config.js');
var http = require('http');
var unitMap = require('../unitMapping.js');

//check if it is a valid data stream
function validateData(logger, data) {
  var error = '';
  if(!data.bt) error = 'no bt supplied';
  else if (data.bt === null) error = 'bt cannot be null';
  else if (!data.e) error = 'no e supplied';

  if(error.length > 0) return error;
  else return true;
}

function fluxator(logger, data) {
  var check = validateData(logger, data);
  //logger.info(data);
    if (check != true) {
      logger.error({error: check, dtata: data});
      return null;
    }
    ///generate packet
    var batch = '';
    //console.log(data);
    data.bt *= 1000; //set timestamp to miliseconds
    //logger.info(JSON.stringify(data));

    data.e.forEach(function(item){

      //generate new measurment types
      var sTags = item['n'].split('/');
      //first one should be dud
      //second is sensor
      //logger.info(item);
      var s_model = sTags[1];
      //third if exist is type or id
      //if not exist make same as sensor
      //if number it is id
      var s_type = sTags.length > 2 ? (typeof sTags[2] === 'number' ? sTags[1] : sTags[2]) : sTags[1];
      //third should be id, if no id check second else default to 1
      var s_id = 1;
      if(sTags.length === 3) s_id = typeof sTags[2] === 'number' ? sTags[2] : s_id;
      if(sTags.length === 4) s_id = sTags[3];
      var measurement = unitMap[s_model][s_type];

      var value = ('v' in item)?(item.v):(item.s);

      if(Array.isArray(value)) {
        if (value.length > 4) {

          //logger.info ('batch');
          //if i = s
          var interval = item.i?item.i:1;
          //set interval to miliseconds
          interval *= 1000; //set to miliseconds
          //if i = ms
          //var interval = item.i?item.i/1000:1;
          // logger.info('length: ' + item.v.length);
          // logger.info('interval: ' + interval);
          // logger.info('subtract: ' + ((item.v.length - 1) * interval));
          var timeIteration = data.bt - ((value.length - 1)  * interval);
          value.forEach(function(val){
            // var line = item.n + ',d_id=' + data.d_id;
            // if (val == undefined) logger.info('Value undefined: ' + item);
            // line += ('v' in item)?' v1=' + val:' s1=' + val;
            // line += ' ' + timeIteration;
            //
            //
            // batch += line + '\n';

            //testing new format
            var linex = measurement + ',d_id=' + data.d_id;
            linex += ',s_model=' + s_model;
            linex += ',s_type=' + s_type;
            linex += ',s_id=' + s_id;
            if (val == undefined) logger.info('Value undefined: ' + item);
            linex += ('v' in item)?' v1=' + val:' s1=' + val;
            linex += ' ' + timeIteration;
            timeIteration += interval;
            //console.log(linex + '\n');
            batch += linex + '\n';

          });
        } else {
          //logger.info ('multival');
          // var line = item.n + ',d_id=' + data.d_id;
          // var i = 1;
          // value.forEach(function(val){
          //   if (val == undefined) logger.info('Value undefined: ' + item);
          //   line += i===1?' ':',';
          //   line += ('v' in item)?'v' + i + '=' + val:'s' + i + '=' + val;
          //   i++;
          // });
          // line += ' ' + data.bt;
          // batch += line + '\n';

          //testing new format
          var linex = measurement + ',d_id=' + data.d_id;
          linex += ',s_model=' + s_model;
          linex += ',s_type=' + s_type;
          linex += ',s_id=' + s_id;
          var i = 1;
          value.forEach(function(val){
            if (val == undefined) logger.info('Value undefined: ' + item);
            linex += i===1?' ':',';
            linex += ('v' in item)?'v' + i + '=' + val:'s' + i + '=' + val;
            i++;
          });
          linex += ' ' + data.bt;
          //console.log(linex + '\n');
          batch += linex + '\n';
        }
      } else {
        // var line = item.n + ',d_id=' + data.d_id;
        // if('v' in item) line += ' v1=' + item.v;
        // if('s' in item) line += ' s1=' + item.s;
        // line += ' ' + data.bt;
        // batch += line + '\n';

        //testing new format
        var linex = measurement + ',d_id=' + data.d_id;
        linex += ',s_model=' + s_model;
        linex += ',s_type=' + s_type;
        linex += ',s_id=' + s_id;
        if('v' in item) linex += ' v1=' + item.v;
        if('s' in item) linex += ' s1=' + item.s;
        linex += ' ' + data.bt;
        //console.log(linex);
        batch += linex + '\n';
      }
    });
  return batch;
}

module.exports = fluxator;
