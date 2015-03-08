'use strict';
var help = require('../help.js');
var u = require('./utils.js');
var devFind = require('./devicesFind.js');
var devUpdate = require('./devicesUpdate.js');
var devUnregister = require('./devicesUnregister.js');
var data = require('./data.js');
var coapClient = require('./coapClient.js');

function httpGetRoot(req, res){
    //TODO: add event logging
    u.logHttpRequest(req);
    res.setHeader('content-type','text/plain');
    res.send(help.top);
}

function httpGetStatus(req, res){
    //TODO: add event logging
    u.logHttpRequest(req);
    res.setHeader('Access-Control-Allow-Origin','*');
    res.json(200,{status: 'DiSoNa on-line'});
}

function httpGetStatusHelp(req, res){
    //TODO: add event logging
    u.logHttpRequest(req);
    res.setHeader('content-type','text/plain');
    res.send(help.status);
}

function httpGetIpAddress(req, res){
    //TODO: add event logging
    u.logHttpRequest(req);
    res.setHeader('Access-Control-Allow-Origin','*');
    res.json(200,{ipaddress: u.getRemoteHttpIp(req)});
}
    
function httpGetIpAddressHelp(req, res){
    //TODO: add event logging
    u.logHttpRequest(req);
    res.setHeader('content-type','text/plain');
    res.send(help.ipaddress);
}

function httpPostDevices(req,res){
    var registerDevice = require("./deviceRegister.js");
    //TODO: add event logging
    res.setHeader('Access-Control-Allow-Origin','*');
    req.params.ipAddress = req.params.ipAddress || u.getRemoteHttpIp(req);
    u.logHttpRequest(req);
    registerDevice(config, req.params, function(err,device){
        if(err) u.handleError(err,res);
        res.json(200,device);
    });
}

function httpDelDeviceUuid(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    u.logHttpRequest(req);
    data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
        if(err) u.handleError(err,res);
        devUnregister.unregisterDevice(req.params.id, function dbUnregisterDevice(err,data){
            if(err) u.handleError(err,res);
            res.json(200,data);
        });
    });
}

function httpGetDevices(req,res){
    res.setHeader('Access-Control-Allow-Origin','*');
    u.logHttpRequest(req);
    data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
        if(err) u.handleError(err,res);
        devFind.findAll(function httpGetDevices(err,devices){
            if(err) u.handleError(err,res);
            res.json(200,devices);
        });
    });
}

function httpGetDeviceUuid(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    u.logHttpRequest(req);
    data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
        if(err) u.handleError(err,res);
        devFind.findByUuids(req.params.id, function(err,device){
            if(err) u.handleError(err,res);
            res.json(200,device);
        });
    });
}

function httpPutDeviceUuid(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    u.logHttpRequest(req);
    data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
        if(err) u.handleError(err,res);
        devUpdate.updateDevice(req.params.id, req.params, function httpupdateDevice(err,device){
            if(err) u.handleError(err,res);
            res.json(200,device);
        });
    });
}
    
function httpGetDeviceDiscoverDirectUuid(req,res){
    res.setHeader('Access-Control-Allow-Origin','*');
    u.logHttpRequest(req);
    data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
        if(err) u.handleError(err,res);
        devFind.findByUuids(req.params.id, function(err,device){
            if(err) u.handleError(err,res);
            coapClient.discover(device.hostName || device.ipAddress, device.port,function(err,coapRes){
                if(err) u.handleError(err,res);
                var map = u.linkFormatToJson(coapRes.payload.toString());
                var data = {
                    mapping: map,
                    online: true
                };
                devUpdate.updateDevice(device.uuid,data, function(err,device){
                    if(err) u.handleError(err,res);
                    res.json(map);
                })
            });
        });
    });
}

function httpGetDeviceQueryDirect(req,res){
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
}

function httpRoutes(server,config){
    //////////////////////////////////////////////
    //BASIC QUERIES
    /////////////////////////////////////////////
    server.get('/', httpGetRoot); //http://url/
    server.get('/status', httpGetStatus); //http://url/status
    server.get('/status/help',httpGetStatusHelp );
    server.get('/ipaddress', httpGetIpAddress); //http://url/ipaddress
    server.get('/ipaddress/help', httpGetIpAddressHelp);
    
    /////////////////////////////////////////////
    //DEVICES
    /////////////////////////////////////////////
    //register device
    server.post('/devices', httpPostDevices); //curl -X POST -d"name=xxx%uuid=yyy" http://url/devices
    //unregister device from the database
    server.del('/devices/:uuid', httpDelDeviceUuid);
    //list all agent's devices
    server.get('/devices', httpGetDevices);
    //get device info from the database
    server.get('/devices/:uuid', httpGetDeviceUuid);
    //update device info on the database
    server.put('/devices/:uuid', httpPutDeviceUuid);
    
    //DEVICES/DISCOVER
    /////////////////////////////////////////////
    //Check if CoAP device is on-line and update resource map
    server.get('/devices/discover/direct/:uuid', httpGetDeviceDiscoverDirectUuid);
    //Check if CoAP device is on-line and update resource map
    server.get(/^(\/devices\/query\/direct\/)([a-zA-Z0-9-]+)(\/.*)/, httpGetDeviceQueryDirect);
    
    server.get(/^(\/devices\/observe\/direct\/)([a-zA-Z0-9-]+)(\/.*)/, httpGetDeviceQueryDirect);
    
    //Check if CoAP device is on-line and update resource map
    server.get('/devices/scan/:ip',function httpGetDevicesScanIp(req,res){
        res.setHeader('Access-Control-Allow-Origin','*');
        u.logHttpRequest(req);
        data.authorize(req.headers.auth_uuid,req.headers.auth_token, function(err,authed){
            if(err) u.handleError(err,res);
            for (var i = 1; i <= 10000; i++) {
            
                coapClient.discover(req.params.ip, i,function(err,coapRes){
                    if(err) console.log(err);
                    //TODO: add to database or update database
                    console.log(coapRes.rsinfo);
                });
            }
        });
    });
}

module.exports = httpRoutes;