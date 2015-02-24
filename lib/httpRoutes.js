'use strict';
var help = require('../help.js');
var registerDevice = require("./deviceRegister.js")

function logRequest(req){
    var date = new Date();
    var msg = '[HTTP][Request][' + date.toDateString() + '][' + date.toTimeString() + ']';
        msg += ' ' + req.route.method;
        msg += ' ' + req.route.path;
        msg += ' FROM: ' + getRemoteIP(req);
    console.log(msg);
}

function getRemoteIP(req){
    return  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

function httpRoutes(server,config){
    //////////////////////////////////////////////
    //BASIC QUERIES
    /////////////////////////////////////////////
    //http://url/
    server.get('/', function(req, res){
        //TODO: add event logging
        logRequest(req);
        res.setHeader('content-type','text/plain');
        res.send(help.top);
    });
    
    //http://url/status
    server.get('/status', function(req, res){
        //TODO: add event logging
        logRequest(req);
        res.setHeader('Access-Control-Allow-Origin','*');
        res.json(200,{status: 'on-line'});
    });
    server.get('/status/help', function(req, res){
        //TODO: add event logging
        logRequest(req);
        res.setHeader('content-type','text/plain');
        res.send(help.status);
    });
    
    //http://url/ipaddress
    server.get('/ipaddress', function(req, res){
        //TODO: add event logging
        logRequest(req);
        res.setHeader('Access-Control-Allow-Origin','*');
        res.json(200,{ipaddress: getRemoteIP(req)});
    });
    server.get('/ipaddress/help', function(req, res){
        //TODO: add event logging
        logRequest(req);
        res.setHeader('content-type','text/plain');
        res.send(help.ipaddress);
    });
    
    /////////////////////////////////////////////
    //DEVICES
    /////////////////////////////////////////////
    //register device
    //curl -X POST -d"name=xxx%uuid=yyy" http://url/devices
    server.post('/devices', function(req,res){
        //TODO: add event logging
        res.setHeader('Access-Control-Allow-Origin','*');
        req.params.ipAddress = req.params.ipAddress || getRemoteIP(req);
        console.log(req.params.ipAddress);
        registerDevice(req.params, function(err,device){
            if(err) {
                console.log(err);
                res.json(200,err);
            }
            res.json(200,device);
        })
    })
}

module.exports = httpRoutes;