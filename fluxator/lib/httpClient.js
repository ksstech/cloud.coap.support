'use strict'
var config = require('../config.js');
var http = require('http');

function httpClient(logger){
  var that = this;
  this._logger = logger;
  this.ping(function (err,code){
    that._logger.info('httpClient: ' + code);
  });
};

httpClient.prototype.ping = function(callback){
  var that = this;
  var options = {
    hostname: config.influxDB.host,
    port: config.influxDB.port,
    path: '/ping',
    method: 'GET'
  };
  var req = http.request(options, function(res) {
    return callback(null,res.statusCode);
  });
  req.end();
  req.on('error', function(e) {
    that._logger.error('Problem with ping: ' + e.message);
    return callback(e,503);
  });
};

httpClient.prototype.sendBatch = function(batch, callback) {
  var that = this;
  var options = {
    hostname: config.influxDB.host,
    port: config.influxDB.port,
    path: '/write?precision=ms&db=' + config.influxDB.senseDB,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': batch.length
    }
  };
  var req = http.request(options, function(res) {
    callback(null,res.statusCode);
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      that._logger.info('InfluxDB: Status: ' + res.statusCode + ': Body: ' + chunk);
    });
  });
  req.write(batch);
  req.end();

  req.on('error', function(e) {
    that._logger.error('Batch:' + batch + '\n\nProblem with request: ' + e.message);
    callback(e,503);
  });


};

module.exports = httpClient;
