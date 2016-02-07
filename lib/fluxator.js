'use strict'
var config = require('../config.js');
var http = require('http');

function fluxator(amqp, logger) {
  amqp.on(amqp.sense, function(data){

    ///generate packet
    var batch = '';
    //console.log(data);
    data.e.forEach(function(item){

      var value = ('v' in item)?(item.v):(item.s);

      if(Array.isArray(value)) {
        if (value.length > 4) {

          //logger.info ('batch');
          var interval = item.i?item.i/1000:1;
          //logger.info('length: ' + item.v.length);
          //logger.info('interval: ' + interval);
          //logger.info('subtract: ' + ((item.v.length - 1) * interval));
          var timeIteration = data.bt - ((value.length - 1)  * interval);
          value.forEach(function(val){
            var line = item.n + ',d_id=' + data.d_id;
            line += ('v' in item)?' v1=' + val:' s1=' + val;
            line += ' ' + timeIteration;
            timeIteration += interval;
            batch += line + '\n';

          });
        } else {
          //logger.info ('multival');
          var line = item.n + ',d_id=' + data.d_id;
          var i = 1;
          value.forEach(function(val){
            line += i===1?' ':',';
            line += ('v' in item)?'v' + i + '=' + val:'s' + i + '=' + val;
            i++;
          });
          line += ' ' + data.bt;
          batch += line + '\n';
        }
      } else {
        var line = item.n + ',d_id=' + data.d_id;
        if('v' in item) line += ' v1=' + item.v;
        if('s' in item) line += ' s1=' + item.s;
        line += ' ' + data.bt;
        batch += line + '\n';
      }
    });

    //console.log(batch);

    var options = {
      hostname: config.influxDB.host,
      port: config.influxDB.port,
      path: '/write?precision=s&db=' + config.influxDB.senseDB,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': batch.length
      }
    };

    var req = http.request(options, function(res) {
      if (res.statusCode != 204) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
          logger.error('InfluxDB: Status: ' + res.statusCode + ': Body: ' + chunk);
        });
        res.on('end', function() {
          //console.log('No more data in response.')
        })
      }
    });

    req.on('error', function(e) {
      logger.error('Problem with request: ' + e.message);
    });

    // write data to request body
    req.write(batch);
    req.end();

  });
}

module.exports = fluxator;
