'use strict';
var coap = require('coap');
//var url = require('url');
var fs = require('fs');

function logSendRequest(url,data){
    var msg = 'CoAP SEND Request: ';
    msg += url.method + ' ';
    msg += url.hostname + ':';
    msg += url.port;
    msg += url.pathname + ' ';
    msg += 'Payload: ' + data;
    this.logger.info(msg);
}

function logSendResponse(url, data){
  var msg = 'CoAP SEND Response: ';
  msg += url.hostname + ':';
  msg += url.port ;
  msg += url.pathname + ' ';
  msg += 'Payload: ' + data;
  this.logger.info(msg);
}

function logSendError(url, data){
  var msg = 'CoAP SEND Error: ';
  msg += url.hostname + ':';
  msg += url.port;
  msg += url.pathname + ' ';
  msg += 'Error: ' + data;
  this.logger.info(msg);
}

function coapClient(logger, mongo, mqtt){
    console.log('coapClient ini');
    this.logger = logger;
    this.mongo = mongo;
    this.mqtt = mqtt;

    function queryResource(device, endPoint, callback){

        //set up url
        url.hostname = device.hostName || device.ipAddress;
        url.port = device.port;
        url.method = 'GET';
        url.pathname = endPoint;
        //url.observe = true;
        //start request

        var req = coap.request(url);
        req.on('response',function(res){
            callback(null,res);
        });
        req.end();
    }

    function observeResource(device, httpReq, httpRes){
        //set up url
        url.hostname = device.hostName || device.ipAddress;
        url.port = device.port;
        url.method = 'GET';
        url.pathname = httpReq.params[2];
        url.observe = true;
        //start request
        var req = coap.request(url);
        req.on('response',function(res){

        });
        req.end();
    }

    function observeResource(device, endPoint, amqpExchange){
        //set up url
        url.hostname = device.hostName || device.ipAddress;
        url.port = device.port;
        url.method = 'GET';
        url.pathname = endPoint;
        url.observe = true;
        //start request
        var req = coap.request(url);
        req.on('response',function(res){
            res.on('data', function(data){
                amqpExchange.publish('response.devices.observe.direct', data.toString());
            });
            res.on('end', function(){
                amqpExchange.publish('response.devices.observe.direct','{uuid: ' + device.uuid + ', endPoint: ' + endPoint + ', message: \'observe stopped\'}');
            });
        });
        req.end();
    }
};

coapClient.prototype.postRegister = function postRegister(address, port, callback){
  console.log('postRegister');
  if(address === '127.0.0.1') callback({ip: '127.0.0.1'});
  var url = {};
  url.hostname = address;
  url.port = port;
  url.method = 'POST';
  url.pathname = '/register';
  console.log(url);
  var sendRequest = coap.request(url);
  //console.log(sendRequest);
  //logSendRequest(url,'');
  sendRequest.on('response',function(res){
    //logSendResponse(url,res.payload.toString());
    console.log(res);
    callback(null,JSON.parse(res.payload.toString()));
  });
  sendRequest.on('error',function(err){
    //logSendError(url,err);
    console.log(err);
    callback(err);
  });
  sendRequest.end();
}

coapClient.prototype.postRules = function postRules(mote, callback){
    //read rules from file
    //var fname =  '/home/marsel/rules/' + mote.d_hw;
    var fname =  '/home/ubuntu/rules/' + mote.d_hw;
    var url = {};
    fs.readFile(fname, {encoding: 'utf-8'}, function(err,rules){
        if(err) {
             logger.error('coapClient: postRules: ' + err);
             return callback(err);
        }
        url.hostname = mote.hostname;
        url.port = mote.port;
        url.method = 'POST';
        url.pathname = '/rules';
        var req = coap.request(url);
        req.setOption('Content-Format','text/plain');

        logSendRequest(url,rules);
        req.on('response',function(res){
           logSendResponse(url,res.payload.toString());
           callback(null,JSON.parse(res.payload.toString()));
        });
        req.on('error', function(err){
            logSendError(url,err);
            callback(err);
        });

        req.end(rules, {encoding: 'utf-8'});
    });

}

module.exports = coapClient;
