'use strict';
var help = require('../help.js');
var u = require('./utils.js');
var devFind = require('./devicesFind.js');
var devUpdate = require('./devicesUpdate.js');
var devUnregister = require('./devicesUnregister.js');
var data = require('./data.js');
var coapClient = require('./coapClient.js');

function httpRoutes(server,config){
    //////////////////////////////////////////////
    //BASIC QUERIES
    /////////////////////////////////////////////
    //http://url/
    server.get('/', function(req, res){
        //TODO: add event logging
        u.logHttpRequest(req);
        res.setHeader('content-type','text/plain');
        res.send(help.top);
    });
    
    //http://url/status
    server.get('/status', function(req, res){
        //TODO: add event logging
        u.logHttpRequest(req);
        res.setHeader('Access-Control-Allow-Origin','*');
        res.json(200,{status: 'DiSoNa on-line'});
    });
    server.get('/status/help', function(req, res){
        //TODO: add event logging
        u.logHttpRequest(req);
        res.setHeader('content-type','text/plain');
        res.send(help.status);
    });
    
    //http://url/ipaddress
    server.get('/ipaddress', function httpGetIpAddress(req, res){
        //TODO: add event logging
        u.logHttpRequest(req);
        res.setHeader('Access-Control-Allow-Origin','*');
        res.json(200,{ipaddress: u.getRemoteHttpIp(req)});
    });
    server.get('/ipaddress/help', function(req, res){
        //TODO: add event logging
        u.logHttpRequest(req);
        res.setHeader('content-type','text/plain');
        res.send(help.ipaddress);
    });
    
    /////////////////////////////////////////////
    //DEVICES
    /////////////////////////////////////////////
    //register device
    //curl -X POST -d"name=xxx%uuid=yyy" http://url/devices
    server.post('/devices', function httpPostDevices(req,res){
        var registerDevice = require("./deviceRegister.js");
        //TODO: add event logging
        res.setHeader('Access-Control-Allow-Origin','*');
        req.params.ipAddress = req.params.ipAddress || u.getRemoteHttpIp(req);
        u.logHttpRequest(req);
        registerDevice(config, req.params, function(err,device){
            if(err) u.handleError(err,res);
            res.json(200,device);
        });
    });
    
    server.get('/devices', function httpPostDevices(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        u.logHttpRequest(req);
        data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
            if(err) u.handleError(err,res);
            devFind.findAll(function httpGetDevices(err,devices){
                if(err) u.handleError(err,res);
                res.json(200,devices);
            });
        });
    });
    
    //Check if CoAP device is on-line and update resource map
    server.get('/devices/discover/direct/:id',function httpGetDeviceDiscoverDirect(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        u.logHttpRequest(req);
        data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
            if(err) u.handleError(err,res);
            devFind.findByUuids(req.params.id, function(err,device){
                if(err) u.handleError(err,res);
                coapClient.discover(device.hostName || device.ipAddress, device.port,function(err,coapRes){
                    if(err) u.handleError(err,res);
                    //TODO: add to database or update database
                    res.json(u.linkFormatToJson(coapRes.payload.toString()));
                });
            });
        });
    });
    
    //get device infor from the database
    server.get('/devices/:id', function httpPutDevice(req, res){
        res.setHeader('Access-Control-Allow-Origin','*');
        u.logHttpRequest(req);
        data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
            if(err) u.handleError(err,res);
            devFind.findByUuids(req.params.id, function(err,device){
                if(err) u.handleError(err,res);
                res.json(200,device);
            });
        });
    });
    
    //update device info on the database
    server.put('/devices/:id', function httpGetDevice(req, res){
        res.setHeader('Access-Control-Allow-Origin','*');
        u.logHttpRequest(req);
        data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
            if(err) u.handleError(err,res);
            devUpdate.updateDevice(req.params.id, req.params, function httpupdateDevice(err,device){
                if(err) u.handleError(err,res);
                res.json(200,device);
            });
        });
    });
    
    //delete device from the database
    server.del('/devices/:id', function httpPutDevice(req, res){
        res.setHeader('Access-Control-Allow-Origin','*');
        u.logHttpRequest(req);
        data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
            if(err) u.handleError(err,res);
            devUnregister.unregisterDevice(req.params.id, function httpupdateDevice(err,data){
                if(err) u.handleError(err,res);
                res.json(200,data);
            });
        });
    });
    
    //Check if CoAP device is on-line and update resource map
    server.get(/^(\/devices\/query\/direct\/)([a-zA-Z0-9-]+)(\/.*)/,function httpGetDeviceDiscoverDirect(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        //this is to get a non regex representation of the path
        req.route.path = req.params[0] + req.params[1] + req.params[2];
        u.logHttpRequest(req);
        data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
            if(err) u.handleError(err,res);
            devFind.findByUuids(req.params[1], function(err,device){
                if(err) u.handleError(err,res);
                coapClient.queryResource(device.hostName || device.ipAddress, device.port, req.params[2], function(err,coapRes){
                    if(err) u.handleError(err,res);
                    //TODO: add to database or update database
                    res.json(JSON.parse(coapRes.payload.toString()));
                });
            });
        });
    });
}

module.exports = httpRoutes;