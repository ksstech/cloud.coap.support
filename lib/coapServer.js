'use strict';
/////////////////////////////////////////
//Use for motes to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var config = require('../config.js');
var qs    = require('qs');
var fs = require('fs');
var dgram       = require('dgram')
    , packet      = require('coap-packet')
    , generate    = packet.generate
    , payload     = new Buffer('Hello World')
    , message     = generate({ payload: payload })
    , port        = 5683
    , client      = dgram.createSocket("udp4")


function coapServer(logger, activeMotes, mqtt, coapClient){
    //var coapClient = require('./coapClient')(logger,mongo,mqtt);
    var server = dgram.createSocket("udp4");
    var parse = packet.parse;
    server.bind(port, function() {
      logger.info('UDP is rocking on port: %s',port);
    });

    server.on('message', function(data, rinfo) {
      var req = {source: rinfo, packet: parse(data)};
      var res = {source: rinfo, packet: parse(data)};
      req.packet.token = req.packet.token.toString();
      req.packet.payload = req.packet.payload.toString();


      //figure out what to do
      /////////////////////////////////
      //PING
      ///////
      //code: '0.00'      //confirmable: true      //reset: false      //ack: false      //options.length = 0      //token empty      //payload empty
      if (req.packet.code === '0.00' && req.packet.confirmable && req.packet.reset === false &&
          req.packet.ack === false && req.packet.token.length === 0 &&
          req.packet.payload.length === 0) {
        //send ACK
        console.log('COAP PING FROM ' + req.source.address + ':' + req.source.port);
        res.packet.confirmable = false;
        res.packet.ack = true;
        var message = generate(res.packet);
        server.send(message,0,message.length,res.source.port,res.source.address,function(err){
          if(err) logger.info(err);
          else {
            console.log('COAP ACK  TO   ' + res.source.address + ':' + res.source.port);
            ping(req.source.address, req.source.port, function pingcb(err){
        			if(err) logger.info(err);
        		});
          }
        });

      }
      /////////////////////////////
      //DATA
      //////////
      else if (req.packet.code === '2.05' && req.packet.reset === false &&
          req.packet.ack === false &&
          req.packet.payload.length != 0) {
        console.log('COAP DATA FROM ' + req.source.address + ':' + req.source.port);
        if(req.packet.confirmable) {
          console.log('COAP TO   ACK ' + req.source.address + ':' + req.source.port);
          res.packet.confirmable = false;
          res.packet.ack = true;
          res.packet.code = '0.00'
          //res.packet.token = new Buffer('');
          res.packet.payload = new Buffer('');
          res.packet.options = [];
          var message = generate(res.packet);
          server.send(message,0,message.length,res.source.port,res.source.address,function(err){
            if(err) logger.info(err);
            else {
              console.log('COAP ACK  TO   ' + res.source.address + ':' + res.source.port);
              console.log(res);
            }
          });
        }
        handleMoteFeedback(req.packet.payload, function moteFeedbackCB(){
          console.log('CoAP Mote Feedback %s:%s %s', req.source.address, req.source.port, req.packet.payload);
        });
      }
      else {
        console.log('COAP UNKN FROM ' + req.source.address + ':' + req.source.port);
        console.log(req);
      }
      //server.close();
    });



    var coapServer = coap.createServer();
    var agentOps = {port: 5683, type: 'udp4'};

    //coapServer.on('request', coapRouter.process);
    coapServer.on('request', process);
    coapServer.on('error', logger.error);

    config.coap_port = config.coap_port || 5683;
    //coapServer.listen(config.coap_port, function(){
    //    logger.info('CoAP is rocking on port: %s',config.coap_port);
    //});

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
      },5000);
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

    function postRules(mote, callback){
        var fname =  '/home/ubuntu/rules/' + mote.d_hw;
        var url = {};
        fs.readFile(fname, {encoding: 'utf-8'}, function(err,rules){
            if(err) {
                 return callback(err);
            }
            url.hostname = mote.hostname;
            url.port = mote.port;
            url.method = 'POST';
            url.pathname = '/rules';
            url.agent = new coap.Agent(agentOps);
            var req = coap.request(url);
            //console.log('CoAP SEND Request: %s %s:%s%s',url.method,url.hostname,url.port,url.pathname);
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
    	//var feedback = JSON.parse(data.payload);
    	mqtt.publishFeedback(data);
    	callback (null);
    }

    function observeMote(mote, rules, callback){

    }

    function process(req, res){
        var data = {
        	method: req.method,
        	url: req.url.replace(/\u0000/g,''),
        	payload: req.payload.toString(),
        	clientAddress: req.rsinfo.address,
        	clientPort: req.rsinfo.port,
        	socket: req.rsinfo,
        	confirm: req._packet.confirmable
        };
        //console.log('CoAP Receive Request: ' + JSON.stringify({host: req.rsinfo, method: req.method, endpoint: req.url, confirmable: req._packet.confirmable, messageId: req._packet.messageId, token: req._packet.token.toString(), payload: req.payload.toString()}));

    	///PING
    	if(data.payload.length === 0 &&
    			data.confirm === true &&
    			data.method === undefined &&
    			data.url === '/'){
    		ping(data, function pingcb(err){
    			if(err) logger.error(err);
    		});
    	}
    	//SENSE or ALERT
        else if(//activeMotes.exist({hostname: data.clientAddress, port: data.clientPort}) &&
        		data.payload.length > 0 &&
        		data.method === undefined &&
        		data.url === '/') {
              //logger.info('sense received: '+ data.payload);
        	handleMoteFeedback(data, function moteFeedbackCB(){
            logger.info('CoAP Mote Feedback %s:%s %s', data.clientAddress, data.clientPort, data.payload);
          });

        }
    	//UNKNOWN
        else {
        	logger.info('CoAP Unknown Request: %s  %s', JSON.stringify(data.socket), JSON.stringify(data.payload))
        }
    }

    function ping(address, port, callback){
    	//logger.info('CoAP PING Request:' + address + ':' + port);
		//if(data.method === 'GET' && data.url === '/ping') res.end();
		postRegister(address,port, function postRegisterCallback(err,resData){
			if(err) callback(err);
			else {
        resData.hostname = address;
        resData.port = port;
				//logger.info('resData: ' + JSON.stringify(resData));
        activeMotes.addMote(resData, function registerMoteCallback(err, mote){
					if(err) callback(err);
					else {
            //logger.info('mote: ' + JSON.stringify(mote));
						mqtt.publishRegister(mote);
						postRules(mote, function postRulesCallback(err,rules){
              if(err) callback(err);
							else {
                //logger.info('rules: ' + rules);
                callback(null);
              }
						});
					}
				});
			}
		});
    }


}

module.exports = coapServer;
