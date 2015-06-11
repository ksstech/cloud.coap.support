'use strict';
/////////////////////////////////////////
//Use for motes to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var config = require('../config.js');
var qs    = require('qs');
var fs = require('fs');

function coapServer(logger, activeMotes, mqtt, coapClient){
    //var coapClient = require('./coapClient')(logger,mongo,mqtt);

    var coapServer = coap.createServer();
    var agentOps = {port: 5683, type: 'udp4'};

    //coapServer.on('request', coapRouter.process);
    coapServer.on('request', process);
    coapServer.on('error', logger.error);

    config.coap_port = config.coap_port || 5683;
    coapServer.listen(config.coap_port, function(){
        logger.info('CoAP is rocking on port: %s',config.coap_port);
    });

    function postRegister(address, port, callback){
      var url = {};
      url.hostname = address;
      url.port = port;
      url.method = 'POST';
      url.pathname = '/register';
      url.agent = new coap.Agent(agentOps);

      var req = coap.request(url);
      logger.info('CoAP SEND Request: %s %s:%s%s',url.method,url.hostname,url.port,url.pathname);
      req.on('response',function(res){
        logger.info('CoAP SEND Response: (%s) %s %s:%s%s Payload: %s',res.code, url.method,url.hostname,url.port,url.pathname, res.payload.toString());
        callback(null,JSON.parse(res.payload.toString()));
      });
      req.on('error',function(err){
        logger.info('CoAP SEND Error: %s %s:%s%s: Error:',url.method,url.hostname,url.port,url.pathname,err);
        callback(err);
      });
      req.end();
    }

    function postRules(mote, callback){
        var fname =  '/home/ubuntu/rules/' + mote.d_hw;
        var url = {};
        fs.readFile(fname, {encoding: 'utf-8'}, function(err,rules){
            if(err) {
                 return callback(err);
            }
            url.hostname = mote.ip;
            url.port = mote.port;
            url.method = 'POST';
            url.pathname = '/rules';
            url.agent = new coap.Agent(agentOps);
            var req = coap.request(url);
            logger.info('CoAP SEND Request: %s %s:%s%s',url.method,url.hostname,url.port,url.pathname);
            req.setOption('Content-Format','text/plain');
            req.on('response',function(res){
              logger.info('CoAP SEND Response: (%s) %s %s:%s%s',res.code, url.method,url.hostname,url.port,url.pathname);
              callback(null,rules);
            });
            req.on('error', function(err){
              logger.info('CoAP SEND Error: %s %s:%s%s: Error:',url.method,url.hostname,url.port,url.pathname,err);
                callback(err);
            });

            req.end(rules, {encoding: 'utf-8'});
        });
    }
    
    /////////////////////////////////////////////
    // post to mqtt channel and update mote timestamp
    function handleMoteFeedback(data, callback) {
    	var feedback = JSON.parse(data.payload);
    	mqtt.publishFeedback(feedback);
    	callback (null);
    }

    function observeMote(mote, rules, callback){

    }

    function process(req,res){
        var data = {};
        console.log('CoAP Receive Request: ' + JSON.stringify({host: req.rsinfo, method: req.method, endpoint: req.url, confirmable: req._packet.confirmable, messageId: req._packet.messageId, token: req._packet.token.toString(), payload: req.payload.toString()}));
        data.method = req.method;
        data.url = req.url.replace(/\u0000/g,'');
        data.payload = req.payload.toString();
        data.clientAddress = req.rsinfo.address;
        data.clientPort = req.rsinfo.port;
        data.socket = req.rsinfo;
        data.confirm = req._packet.confirmable;
        if(req.headers['Content-Format'] || req.headers['Content-Type'])
            data.contentFormat = req.headers['Content-Format'] || req.headers['Content-Type'];
        else
            data.contentFormat = 'application/json';
        if(data.clientAddress !== '127.0.0.1')
          route(data,res);
    }

    function route(data,res){
    	////////////////////////////
    	///PING
    	if((data.payload === "" && data.confirm === true && data.method === undefined && data.url === '/') || (data.method === 'GET' && data.url === '/ping')){
    		logger.info('CoAP PING Request:' + JSON.stringify(data.socket));
    		if(data.method === 'GET' && data.url === '/ping') res.end();
    		postRegister(data.clientAddress,data.clientPort, function postRegisterCallback(err,resData){
    			if(err) return;
    			else {
    				activeMotes.add(data.clientAddress, data.clientPort, resData, function registerMoteCallback(err, mote){
    					if(err) return logger.error('Mongo registerMote: %s', err);
    					else {
    						mqtt.publishRegister(mote);
							postRules(mote, function postRulesCallback(err,rules){
								if(err) return logger.error('CoAP postRules: %s', err);
								//else logger.info(rules);
							});
    					}
    				});
    			}
    		});
    	}
    	////////////////////////////////////
    	//SENSE or ALERT
        else if(activeMotes.exist({hostname: data.clientAddress, port: data.clientPort}) && 
        		data.payload.length > 0 && 
        		data.method === undefined && 
        		data.url === '/') {
        	handelMoteFeedback(function(){});
        	logger.info('CoAP Mote Feedback %s:%s %s', data.clientAddress, data.clientPort, data.payload);
        } 
        ///////////////////////////////////
    	//UNKNOWN
        else {
        	logger.info('CoAP Unknown Request: %s  %s', JSON.stringify(data.socket), JSON.stringify(data.payload))
        }
    }
}

module.exports = coapServer;
