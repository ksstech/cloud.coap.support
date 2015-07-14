'use strict';
var coap = require('coap');

var agentOps = {port: 5683, type: 'udp4'};

function coapClient(logger){
	this.logger = logger;
	function postRegister(address, port, callback){
	    var url = {};
	    url.hostname = address;
	    url.port = port;
	    url.method = 'POST';
	    url.pathname = '/register';
	    url.agent = new coap.Agent(agentOps);

	    var req = coap.request(url);

	    var tout = setTimeout(function(){
	  	  req.reset();
	  	  callback({error: "time-out on register"});
	    },10000);
	    //logger.info('CoAP SEND Request: %s %s:%s%s',url.method,url.hostname,url.port,url.pathname);
	    req.on('response',function(res){
	      clearTimeout(tout);
	      logger.info('CoAP SEND Response: (%s) %s %s:%s%s Payload: %s',res.code, url.method,url.hostname,url.port,url.pathname, res.payload.toString());
	      callback(null,JSON.parse(res.payload.toString()));
	    });
	    req.on('error',function(err){
	      clearTimeout(tout);
	      logger.info('CoAP SEND Error: %s %s:%s%s: Error:',url.method,url.hostname,url.port,url.pathname,err);
	      callback(err);
	    });
	    req.end();
	    //handle time-outs
	 }


}

coapClient.prototype.postRules = function postRules(mote, rules, callback){
			var that = this;
			var url = {};
			url.hostname = mote.hostname;
			url.port = mote.port;
			url.method = 'POST';
			url.pathname = '/rules';
			url.agent = new coap.Agent(agentOps);
			var req = coap.request(url);
			//console.log('CoAP SEND Request: %s %s:%s%s',url.method,url.hostname,url.port,url.pathname);
			req.setOption('Content-Format','text/plain');
			req.on('response',function(res){
				that.logger.info('CoAP SEND Response: (%s) %s %s:%s%s',res.code, url.method,url.hostname,url.port,url.pathname);
				callback(null,rules);
			});
			req.on('error', function(err){
				that.logger.error('CoAP SEND Error: %s %s:%s%s: Error:',url.method,url.hostname,url.port,url.pathname,err);
				callback(err);
			});
			req.end(rules, {encoding: 'utf-8'});
	}

module.exports = coapClient;
