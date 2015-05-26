'use strict';
var coap = require('coap');
var url = require('url');
var fs = require('fs');

var coapClient = {
    
    
    
    discover: function discover(mote, callback){
        //set up url
        url.hostname = mote.hostName || mote.ip;
        url.port = mote.port || 5683;
        url.method = 'GET';
        url.pathname = '/.well-known/core';
        //start request
        var req = coap.request(url);

        req.on('response',function(res){
            callback(null,{online: true, message: res});
        });
        
        req.on('error', function(err){
            callback(null,{online: false, message: err});
        });
        req.end();
    },
    
    postRules: function postRules(mote, logger, callback){
        //read rules from file
        var fname = 'rules/' + mote.d_hw + '.txt';
        var uri = {};
        fs.readFile(fname, {encoding: 'utf-8'}, function(err,rules){
            if(err) {
                logger.error('coapClient: postRules: ' + err);
                return callback(err);
            }
            uri.hostname = mote.hostName || mote.ip;
            uri.port = mote.port || 5683;
            uri.method = 'POST';
            uri.pathname = '/rules';
            var req = coap.request(uri);
            req.setOption("Content-Format", "text/plain");
            req.end(rules, {encoding: 'utf-8'});
            logger.info('CoAP Client: Request: ' + uri.method + ': ' + uri.hostname + ':' + uri.port + uri.pathname + ': payload: ' + rules);
            req.on('response',function(res){
                logger.info(res),//('CoAP Client: Response: ' + url.method + ': ' + url.hostname + ':' + url.port + url.pathname + ': payload: ' + rules;
                callback(null,res);
            });
        
            req.on('error', function(err){
                logger.error(err);
                callback(err);
            });
        });
        
    },
    
    queryResource: function queryResource(device, endPoint, callback){

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
    },
    
    observeResource: function observeResource(device, httpReq, httpRes){
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
    },
    
    observeResourceAMQP: function observeResource(device, endPoint, amqpExchange){
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

module.exports = coapClient;