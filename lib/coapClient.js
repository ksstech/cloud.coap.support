'use strict';
var coap = require('coap');
var url = require('url');

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
    
    queryResource: function queryResource(hostName, port, path, callback){
        //set up url
        url.hostname = hostName;
        url.port = port || 5683;
        url.method = 'GET';
        url.pathname = path;
        //url.observe = true;
        //start request
        var req = coap.request(url);
        req.on('response',function(res){
            callback(null,res);
        });
        req.end();
    }
};

module.exports = coapClient;