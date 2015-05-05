'use strict';
var registerDevice = require("./deviceRegister.js")
var eventLog = require('./eventLog.js');

function logRequest(req,res){
    var date = new Date();
    var msg = '[COAP][Request][' + date.toDateString() + '][' + date.toTimeString() + ']';
        msg += ' ' + req.method;
        msg += ' ' + req.url;
        msg += ' FROM: ' + req.rsinfo.address + ':' + req.rsinfo.port;
    console.log(msg);
    eventLog.logCoapRequest(req);
    eventLog.logCoapResponse(res);
}

function coapRoutes(coapRouter, config, mqtt){
    //http://url/status
    var mqttServer = mqtt;
    coapRouter.get('/status', function getStatus(req, res){
        res.statusCode = 205;
        res.json({status: 'disona on-line'});
        logRequest(req,res);
    });
    
    coapRouter.get('/ipaddress', function getIpAddress(req, res){
        res.statusCode = 205;
        res.json({ipaddress: req.rsinfo.address, port: req.rsinfo.port});
        logRequest(req,res);
    });
    
    /////////////////////////////////////////////
    //DEVICES
    /////////////////////////////////////////////
    //register device
    //curl -X POST -d"name=xxx%uuid=yyy" http://url/devices
    coapRouter.post('/devices', function postDevices(req,res){
        req.params.ipAddress = req.rsinfo.address;
        req.params.port = req.rsinfo.port;
        res.statusCode = 201;
        mqttServer.publishNewDevice(req.params);
        res.json({message: 'registration received'});
        logRequest(req,res);
    });
    
    //push data
    coapRouter.post('/data', function postDevices(req,res){
        // req.params.ipAddress = req.rsinfo.address;
        // req.params.port = req.rsinfo.port;
        // res.statusCode = 201;
        // mqttServer.publishNewDevice(req.params);
        // res.json({message: 'registration received'});
        // logRequest(req,res);
    });
}

module.exports = coapRoutes;