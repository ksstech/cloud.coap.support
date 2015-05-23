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
    
    postRules: function postRules(mote, callback){
        //read rules from file
        var fname = 'rules/' + mote.d_hw + '.txt';
        fs.readFile(fname, {encoding: 'utf-8'}, function(err,rules){
            if(err) return callback(err);
            console.log(rules);
            url.hostname = mote.hostName || mote.ip;
            url.port = mote.port || 5683;
            url.method = 'POST';
            url.pathname = '/rules';
            var req = coap.request(url);
            req.end(rules, {encoding: 'utf-8'});
            req.on('response',function(res){
                callback(null,res);
            });
            
            req.on('error', function(err){
                callback(err);
            });
            req.end();
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