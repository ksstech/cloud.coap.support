'use strict';
/////////////////////////////////////////
//Use for motes to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var config = require('../config.js');
var fs = require('fs');
var async 	= require('async');
var dgram       = require('dgram')
    , packet      = require('coap-packet')
    , generate    = packet.generate
    , port        = 5683;
var server = dgram.createSocket("udp4");
var parse = packet.parse;
var maxMessageId    = Math.pow(2, 16);
var maxToken        = Math.pow(2, 32);
var coapInFlight = require('./coapInFlight');

var msgRegisterInFlight = [];
var msgSenseInFlight = [];
var msgRuleInFlight = [];
var msgProbeInFlight = [];
var ActiveMotesByAddress = [];
var ActiveMotesById = [];

var lastMessageId = Math.floor(Math.random() * (maxMessageId - 1));
var lastToken = Math.floor(Math.random() * (maxToken - 1));

var logger = null;

//MWP 20150811
//Identify the type of packet for further processing
//Return: ACK (acknowledge), RST (reset), PNG (ping), RER (register response),
//		SER (sense response), RUR (rule response), PRR (probe response), FBD (feedback data), UKN (unknown)
function getPacketType (incoming, logger){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.code === '0.00'){
		if(incoming.packet.ack === true) return 'ACK';
		else if(incoming.packet.reset === true) return 'RST';
		else if(incoming.packet.confirmable === true) return 'PNG';
	} else {
		if(msgRegisterInFlight[uid]) return 'RER';
		else if (msgSenseInFlight[uid]) return 'SER';
		else if (msgRuleInFlight[uid]) return 'RUR';
		else if (msgProbeInFlight[uid]) return 'PRR';
		else if (ActiveMotesByAddress[uid]) return 'FDB';
		else return 'UKN';
	}
}

//MWP 20150812
//Clear in flight data as well as active motes for uid (ip + port)
function deleteMote (uid){
	if(msgRegisterInFlight[uid]){
    msgRegisterInFlight[uid].reset();
    delete msgRegisterInFlight[uid];
  }
	if(msgSenseInFlight[uid]){
    msgSenseInFlight[uid].reset();
    delete msgSenseInFlight[uid];
  }
	if(msgRuleInFlight[uid]){
    msgRuleInFlight[uid].reset();
    delete msgRuleInFlight[uid];
  }
	if(msgProbeInFlight[uid]){
    msgProbeInFlight[uid].reset();
    delete msgProbeInFlight[uid];
  }
	if(ActiveMotesByAddress[uid]) {
		var am = ActiveMotesByAddress[uid];
		if (ActiveMotesById[am.d_id]) delete ActiveMotesById[am.d_id];
		delete ActiveMotesByAddress[uid];
	}
}

//MWP 20150812
//Send an ACK packet back to mote
function sendACK (incoming, callback){
	var packet = {
		ack: true,
		code: '0.00',
		messageId: incoming.packet.messageId,
    token: incoming.packet.token
	};
	var message = generate(packet);
	server.send(message,0,message.length,incoming.source.port,incoming.source.address,function (err){
    if (err) callback(err);
    else {
      //////logger.info('CoAP ACK   to: ' + JSON.stringify(sendInfo(incoming.source.address,incoming.source.port,packet)));
      callback(null);
    }
  });
}

function nextMessageId() {
	if (++lastMessageId === maxMessageId)
	  lastMessageId = 1;
	return lastMessageId;
}

function nextToken() {
	var buf = new Buffer(4);
	if (++lastToken === maxToken) lastToken = 0;
	buf.writeUInt32BE(lastToken, 0);
	return buf;
}

//MWP 20150812
//send a POST /register to the mote in play
function postRegisterRequest(incoming, callback){
	//build packet
	var packet = {
		con: true,
		code: '0.02',
		messageId: nextMessageId(),
		token: nextToken(),
		options: [{
			name: 'Uri-Path',
			value: new Buffer('register')
		}]
	};
	//create in flight object that can handle time outs and resends
	var inFlight = new coapInFlight(server, incoming.source.port, incoming.source.address, 'request', packet)
	var uid = incoming.source.address + incoming.source.port;
	msgRegisterInFlight[uid] = inFlight;
  logger.info('CoAP REG   to: ' + JSON.stringify(sendInfo(incoming.source.address,incoming.source.port,packet)));
	callback(inFlight);
}

//MWP 20150812
// Get the registration process going if ping was received.
// First get rid of any outstanding in flight data
function handlePingRequest(incoming){
	//check for any in flights and remove
	deleteMote(incoming.source.address + incoming.source.port);
	//send ack
	sendACK(incoming, function sendACKCB(err){
		if (err) logger.error(err);
		else {
			postRegisterRequest(incoming, function postRegisterRequestCB(inFlight){});
		}
	});
}

//MWP 20150813
//handle registration data coming in from mote and add to active motes if correct
function handelRegisterResponse(incoming, amqp){
	if(incoming.packet.confirmable) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
	var uid = incoming.source.address + incoming.source.port;
	//delete from inflight
  msgRegisterInFlight[uid].reset();
	delete msgRegisterInFlight[uid];
	//validate data
	var payload = incoming.packet.payload.toString();
	//check data type expecting json
	//if(incoming.packet.options['Content-Format'])
		//if(incoming.packet.options['Content-Format'] === 50) {//application/json
			payload = JSON.parse(incoming.packet.payload);
			//check for valid values
			if (!payload.d_id) return logger.error('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': d_id required');
		    if (!payload.d_hw) return logger.error('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': d_hw required');
		    if (!payload.d_sw) return logger.error('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': d_sw required');
		    if (!payload.d_mf) return logger.error('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': d_mf required');
		    payload.hostname = incoming.source.address;
		    payload.port = incoming.source.port;
		    payload.timestamp = new Date().toISOString();
		    //delete existing
		    if(ActiveMotesByAddress[uid]) delete ActiveMotesByAddress[am.d_id];
	    	if(ActiveMotesById[payload.d_id]) delete ActiveMotesById[payload.d_id];
	    	//add new
	    	ActiveMotesByAddress[uid] = payload;
	    	ActiveMotesById[payload.d_id] = payload;
	    	//send to mqtt
	    	//mqtt.publishRegister(payload);
        amqp.publishRegister(incoming.packet.payload.toString());
		//} else logger.error('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': Incorrect Content-Format. Expected 50, got ' + incoming.packet.options['Content-Format']);
	//else logger.error ('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': No Content-Format supplied');
}

function postRule(hostname, port, path, rules, callback){
	//build packet
	var packet = {
		con: true,
		code: '0.02',
		messageId: nextMessageId(),
		token: nextToken(),
		options: [{
			name: 'Uri-Path',
			value: new Buffer(path)
		},{
			name: 'Content-Format',
			value: new Buffer(0)
		}],
		payload: new Buffer(rules)
	};
	//create in flight object that can handle time outs and resends
	//////logger.info('CoAP ' + path + ' to: ' + hostname + ':' + port);
	var inFlight = new coapInFlight(server, port, hostname, 'request', packet)
	callback(inFlight);
}

//MWP 20150813
//post instructions to the mote specified in the data
function postInstructions(data){
	logger.info('RULES RECEIVED:'+ data);
	//validate data
	if(!data.d_id) logger.error('AMQP: slimjan.rules: no d_id');
	else if(!data.rules) logger.error('AMQP: slimjan.rules: no rules');
	else {
		//check if d_id exist
		if (ActiveMotesById[data.d_id]) {
			//break this up according to the three rules
			var mote = ActiveMotesById[data.d_id];
      logger.info(mote);

            if(data.rules.sense){
	        		postRule(mote.hostname, mote.port, 'sense', data.rules.sense.toString(), function(inFlight){
	        			msgSenseInFlight[mote.hostname + mote.port] = inFlight;
              });
            }
            if(data.rules.rules){
	        		postRule(mote.hostname, mote.port, 'rules', data.rules.rules.toString(), function(inFlight){
	        			msgRuleInFlight[mote.hostname + mote.port] = inFlight;
              });
            }
            if(data.rules.probe){
	        		postRule(mote.hostname, mote.port, 'probe', data.rules.probe.toString(), function(inFlight){
	        			msgProbeInFlight[mote.hostname + mote.port] = inFlight;
              });
            }

		} else {
			logger.error('AMQP: slimjan.rules: mote ' + data.d_id + ' not active');
		}
	}
}

function handleSenseResponse(incoming){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.confirmable) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
  msgSenseInFlight[uid].reset();
	delete msgSenseInFlight[uid];
	//return logger.info('CoAP Sense response: ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.code);
}

function handleRuleResponse(incoming){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.confirmable) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
  msgRuleInFlight[uid].reset();
	delete msgRuleInFlight[uid];
	//return logger.info('CoAP Rule response: ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.code);
}

function handleProbeResponse(incoming){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.confirmable) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
  msgProbeInFlight[uid].reset();
	delete msgProbeInFlight[uid];
	//return logger.info('CoAP Probe response: ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.code);
}

function handleFeedbackResponse (incoming, amqp){
	if(incoming.packet.confirmable) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
	//mqtt.publishFeedback(incoming.packet.payload.toString());
  amqp.publishSense(incoming.packet.payload.toString());
	//logger.info('CoAP Mote Feedback : ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.payload.toString());
}

function packetInfo(packet){
  var info = {
    mote: packet.source.address + ':' + packet.source.port,
    code: packet.packet.code,
    confirmable: packet.packet.confirmable,
    ack: packet.packet.ack,
    reset: packet.packet.reset,
    messageId: packet.packet.messageId,
    tokenSize: packet.packet.token.length,
    payloadSize: packet.packet.payload.length
  };
  return info;
}

function sendInfo(address, port, packet){
  var info = {
    mote: address + ':' + port,
    code: packet.code,
    confirmable: packet.confirmable,
    ack: packet.ack,
    reset: packet.reset,
    messageId: packet.messageId,
    tokenSize: packet.token.length,
    payloadSize: packet.payload.length
  };
  return info;
}

function coapServer(log, amqp){
    //var coapClient = require('./coapClient')(logger,mongo,mqtt);
    logger = log;
    server.bind(port, function() {
      logger.info('UDP is rocking on port: %s',port);
    });

    server.on('message', function(data, rinfo) {
      var req = {source: rinfo, packet: parse(data)};
      //res will be generated elsewhere
      //var res = {source: rinfo, packet: parse(data)};
      req.packet.payload = req.packet.payload.toString();
      var type = getPacketType(req, logger);
      //////logger.info ('CoAP ' + type + ' from: ' + JSON.stringify(packetInfo(req)));
      //////logger.info ('CoAP     data: ' + req.packet.payload);
	  switch (getPacketType(req, logger)) {
      case 'ACK':
      case 'RST':
    	  break;
      case 'PNG':
    	  //invoke  ping
    	  handlePingRequest(req);
    	  break;
      case 'RER':
    	  //do register response
    	  handelRegisterResponse(req, amqp);
    	  break;
      case 'SER':
    	  //do sense response
    	  handleSenseResponse(req);
    	  break;
      case 'RUR':
    	  //do rule response
    	  handleRuleResponse(req);
    	  break;
      case 'PRR':
    	  //do probe response
    	  handleProbeResponse(req);
    	  break;
      case 'FDB':
    	  //do feedback stuff
    	  handleFeedbackResponse(req,amqp)
    	  break;
      default:
    	  //UKN stuff
    	  logger.info('CoAP UKN from: ' + req.source.address + ':' + req.source.port + ': ' + req.packet.payload);
      }
    });

    //mqtt.on('slimjan/rules', function(data){
  	//	postInstructions(data);
  	//});
    	amqp.on(amqp.returnRegister, function(data){
  		postInstructions(data);
  	});

}

module.exports = coapServer;
