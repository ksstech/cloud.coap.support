'use strict';
var coap = require('coap');
var url = require('url');
var u = require('./utils.js');

var coapClient = {
    discover: function discover(hostName, port, callback){
        //set up url
        url.hostname = hostName;
        url.port = port || 5683;
        url.method = 'GET';
        url.pathname = '/.well-known/core';
        //start request
        var req = coap.request(url);
        req.on('response',function(res){
            callback(null,res);
        });
        req.end();
    },
    
    queryResource: function queryResource(device, httpReq, callback){

        //set up url
        

        url.hostname = device.hostName || device.ipAddress;
        url.port = device.port;
        url.method = 'GET';
        url.pathname = httpReq.params[2];
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
            u.logHttpObserveStart(httpReq);
            httpRes.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Transfer-Encoding': 'chunked'});
            res.on('data', function(data){
                httpRes.write(data.toString() + '\n');
            });
            res.on('end', function(){
                httpRes.end();
                u.logHttpObserveEnd(httpReq,httpRes);
            });
            httpRes.on('close', function(){
                res.close();
            });
        });
        req.end();
    }
};

module.exports = coapClient;