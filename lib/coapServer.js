'use strict';
/////////////////////////////////////////
//Use for motes to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var config = require('../config.js');
var qs    = require('qs');
var coapClient = require('./coapClient.js');

function coapServer(logger, mongo, mqtt){
    var coapRouter = require('./coapRouter');
    var coapServer = coap.createServer();
    
    //coapServer.on('request', coapRouter.process);
    coapServer.on('request', process);
    coapServer.on('error', logger.error);
    
    config.coap_port = config.coap_port || 5683;
    coapServer.listen(config.coap_port,"0.0.0.0",function(){
        logger.info('CoAP is rocking on: coap://0.0.0.0:%s',config.coap_port);
    });
    
    function process(req,res){
        var data = {};
        data.method = req.method.toLowerCase();
        data.url = req.url.replace(/\u0000/g,'');
        data.payload = req.payload.toString();
        data.clientAddres = req.rsinfo.address;
        data.clientPort = req.rsinfo.port;
        data.content = formatContent(data.payload);
        data.confirm = req._packet.confirmable;
        if(req.headers['Content-Format'] || req.headers['Content-Type']) 
            data.contentFormat = req.headers['Content-Format'] || req.headers['Content-Type'];
        else
            data.contentFormat = 'application/json';
        route(data,res);
    }
    
    function route(data,res){
        /////////////////////////////
        //GET /
        if(data.method === 'get' && data.url === '/'){
            resJSON(data,res,205,{message: 'on-line'});res.statusCode = 205;
        }
        //////////////////////////////
        //POST /register
        else if(data.method === 'post' && data.url === '/register'){
            mongo.registerMote(data.clientAddres,data.clientPort,data.content, function (err, mote){
                if(err) resJSON(data,res, 402, err);
                else {
                    mqtt.publishRegister(mote);
                    resJSON(data,res, 204, {message: 'acknowledged'});
                    setTimeout(function(){
                        //coapClient.discover(mote,function(err,resp){
                           //if(err) logger.error(err)
                           //if(!resp.online) logger.error(resp.message);
                           //else 
                           coapClient.postRules(mote, logger);
                        //});
                    },5000);
                }
            });
        }
        /////////////////////////////
        //POST /sense
        else if(data.method === 'post' && data.url === '/sense'){
            mongo.refreshMote(data.content, function(err){
                if(err) logger.error(err);
                else {
                    mqtt.publishSense(data.content);
                    resJSON(data,res, 204, {message: 'acknowledged'});
                }
            });
        }
        ////////////////////////////
        //POST /alert
        else if(data.method === 'post' && data.url === '/alert'){
            mongo.refreshMote(data.content, function(err){
                if(err) resJSON(data,res, 402, err);
                else {
                    mqtt.publishAlert(data.content);
                    resJSON(data,res, 204, {message: 'acknowledged'});
                }
            });
        }
        
        else {
            resJSON(data,res,404,{message: 'unknown resource'});   
        }
    }
    
    function resJSON(req, res,code,sendData){
        res.setOption("Content-Format", "application/json");
        res.statusCode = code;
        logger.info(req.confirm);
        logRequest(req,res,JSON.stringify({confirm: req.confirm}));
        if(req.confirm) {
             res.end(JSON.stringify(sendData));
             logRequest(req,res, JSON.stringify(sendData));
        }
    }
    
    function logRequest(data,res, ret){
        var msg = 'CoAP: Request';
            msg += ': ' + data.method;
            msg += ': ' + data.url;
            msg += ': FROM: ' + data.clientAddres + ':' + data.clientPort;
            msg += ' : payload: ' + data.content;
        logger.info(msg);
        var resp = 'CoAP: Response: ' + res.statusCode + ' : ' + ret;
        logger.info(resp);
        
    }
    
    function formatContent(data){
        try {
            return JSON.parse(data);   
        }
        catch(e) {
            if(e instanceof SyntaxError) {
                return qs.parse(data.toString().replace(/^\/.*\?/g, ''));
            }
            else return {};
        }
    }

}

module.exports = coapServer;
