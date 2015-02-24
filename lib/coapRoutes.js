'use strict';
var registerDevice = require("./deviceRegister.js")

function logRequest(req){
    var date = new Date();
    var msg = '[COAP][Request][' + date.toDateString() + '][' + date.toTimeString() + ']';
        msg += ' ' + req.method;
        msg += ' ' + req.url;
        msg += ' FROM: ' + req.rsinfo.address + ':' + req.rsinfo.port;
    console.log(msg);
}

function coapRoutes(coapRouter, config){
    //http://url/status
    
    coapRouter.get('/status', function(req, res){
        logRequest(req);
        res.statusCode = 200;
        res.json({status: 'on-line'});
    });
    
    coapRouter.get('/ipaddress', function(req, res){
        //TODO: add event logging
        logRequest(req);
        res.statusCode = 200;
        res.json({ipaddress: req.rsinfo.address, port: req.rsinfo.port});
    });
    
    /////////////////////////////////////////////
    //DEVICES
    /////////////////////////////////////////////
    //register device
    //curl -X POST -d"name=xxx%uuid=yyy" http://url/devices
    coapRouter.post('/devices', function(req,res){
        //TODO: add event logging
        logRequest(req);
        req.params.ipAddress = req.rsinfo.address;
        req.params.port = req.rsinfo.port;
        registerDevice(req.params, function(err,device){
            if(err) {
                console.error(err);
                res.statusCode = 400;
                res.json(err);
            } else {
                res.statusCode = 200;
                res.json(device);
            }
        })
    })
}

module.exports = coapRoutes;