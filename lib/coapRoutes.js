'use strict';
var config = require('../config.js');
//var registerDevice = require("./deviceRegister.js")
//var eventLog = require('./eventLog.js');



function coapRoutes(coapRouter, logger, mongo, mqtt){
    function logRequest(req,res){
        var msg = 'CoAP: Request';
            msg += ': ' + req.method;
            msg += ': ' + req.url;
            msg += ': FROM: ' + req.rsinfo.address + ':' + req.rsinfo.port;
            
        logger.info(msg);
        if(JSON.stringify(req.params) != '{}') logger.info(JSON.stringify(req.params));
    }
    
    //http://url/status
    var mqttServer = mqtt;
    
    coapRouter.get('/', function get(req, res){
        res.statusCode = 205;
        res.json({message: 'on-line'});
        logRequest(req,res);
    });
    
    coapRouter.post('/register', function postRegister(req, res){
        mongo.registerMote(req.rsinfo.address,req.rsinfo.port,req.params, function (err, mote){
            var returnMessage;
            if(err) {
                logger.error(err);
                res.statusCode = 402;
                returnMessage = err;
            } else {
                mqtt.publishRegister(mote);
                res.statusCode = 204;
                returnMessage = {message: 'acknowledge'};
            }
            res.json(returnMessage);
            logRequest(req,res);
        });
        
    });
    
    coapRouter.post('/status', function postStatus(req, res){
        res.statusCode = 204;
        res.json({message: 'acknowledge'});
        logRequest(req,res);
    });
    
    coapRouter.post('/sense', function postLog(req, res){
        //need to get data structure, idealy d_uuid
        
        res.statusCode = 204;
        res.json({message: 'acknowledge'});
        logRequest(req,res);
    });
    
    coapRouter.post('/alert', function postAlert(req, res){
        res.statusCode = 204;
        res.json({message: 'acknowledge'});
        logRequest(req,res);
    });
}

module.exports = coapRoutes;