'use strict';
/////////////////////////////////////////
//Use for motes to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var config = require('../config.js');
var fs = require('fs');
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

//MWP 20150811
//Identify the type of packet for further processing
//Return: ACK (acknowledge), RST (reset), PNG (ping), RER (register response), 
//		SER (sense response), RUR (rule response), PRR (probe response), FBD (feedback data), UKN (unknown) 
function getPacketType (incoming){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.code === '0.00'){
		if(incoming.packet.ack === true) return 'ACK';
		else if(incoming.packet.reset === true) return 'RST';
		else if(incoming.packet.con === true) return 'PNG';
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
	if(msgRegisterInFlight[uid]) delete msgRegisterInFlight[uid];
	if(msgSenseInFlight[uid]) delete msgSenseInFlight[uid];
	if(msgRuleInFlight[uid]) delete msgRuleInFlight[uid];
	if(msgProbeInFlight[uid]) delete msgProbeInFlight[uid];
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
		messageId: incoming.packet.messageId
	};
	var message = generate(packet);
	server.send(message,0,message.length,incoming.source.port,incoming.source.address,callback(err));
}

function nextMessageId() {
	if (++this._lastMessageId === maxMessageId)
	  this._lastMessageId = 1;
	return this._lastMessageId;
}

function nextToken() {
	var buf = new Buffer(4);
	if (++this._lastToken === maxToken) this._lastToken = 0;
	buf.writeUInt32BE(this._lastToken, 0);
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
function handelRegisterResponse(incoming, mqtt){
	if(incoming.packet.con) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
	var uid = incoming.source.address + incoming.source.port;
	//delete from inflight
	delete msgRegisterInFlight[uid];
	//validate data
	var payload = incoming.packet.payload.toString();
	//check data type expecting json
	if(incoming.packet.options['Content-Format'])
		if(incoming.packet.options['Content-Format'] === 50) {//application/json
			payload = JSON.parse(incoming.packet.payload.toString());
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
	    	mqtt.publishRegister(payload);
		} else logger.error('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': Incorrect Content-Format. Expected 50, got ' + incoming.packet.options['Content-Format']);
	else logger.error ('CoAP Register response: ' + incoming.source.address + ':' + incoming.source.port + ': No Content-Format supplied');
}

function postRule(hostName, port, path, rules, callback){
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
			value: 0
		}],
		payload: new Buffer(rules)
	};
	//create in flight object that can handle time outs and resends
	logger.info('CoAP ' + path + ' Request: ' + incoming.source.address + ':' + incoming.source.port);
	var inFlight = new coapInFlight(server, port, hostName, 'request', packet)
	callback(inFlight);
}

//MWP 20150813
//post instructions to the mote specified in the data
function postInstructions(data){
	logger.info('MQTT: slimjan.rules: ' + data);
	//validate data
	if(!data.d_id) logger.error('MQTT: slimjan.rules: no d_id');
	else if(!data.rules) logger.error('MQTT: slimjan.rules: no rules');
	else {
		//check if d_id exist
		if (ActiveMotesById[data.d_id]) {
			//break this up according to the three rules
			var mote = ActiveMotesById[data.d_id];
			var rules = data.rules.toString();
	        async.series({
	        	sense: function (callback) {
	        		if(!rules.sense) callback(null,'000');
	        		postRule(mote.hostName, mote.port, 'sense', rules.sense, function(inFlight){
	        			msgSenseInFlight[mote.hostName + mote.port] = inFlight;
	        			callback();
	        		});
	        	},
	        	rules: function (callback) {
	        		if(!rules.rules) callback(null,'000');
	        		postRule(mote.hostName, mote.port, 'rules', rules.rules, function(inFlight){
	        			msgRuleInFlight[mote.hostName + mote.port] = inFlight;
	        			callback();
	        		});
	        	},
	        	probe: function (callback) {
	        		if(!rules.probe) callback(null,'000');
	        		postRule(mote.hostName, mote.port, 'probe', rules.probe, function(inFlight){
	        			msgProbeInFlight[mote.hostName + mote.port] = inFlight;
	        			callback();
	        		});
	        	}
	        },
	        function(err){
	        	if (err) logger.error(err);
	        });
		} else {
			logger.error('MQTT: slimjan.rules: mote ' + data.d_id + ' not active');
		}
	}
}

function handleSenseResponse(incoming){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.con) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
	delete msgSenseInFlight[uid];
	return logger.info('CoAP Sense response: ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.code);
}

function handleRuleResponse(incoming){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.con) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
	delete msgRuleInFlight[uid];
	return logger.info('CoAP Rule response: ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.code);
}

function handleProbeResponse(incoming){
	var uid = incoming.source.address + incoming.source.port;
	if(incoming.packet.con) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
	delete msgProbeInFlight[uid];
	return logger.info('CoAP Probe response: ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.code);
}

function handleFeedbackResponse (incoming, mqtt){
	if(incoming.packet.con) {
		sendACK(incoming, function sendACKCB(err){
			if (err) logger.error(err);
		});
	}
	mqtt.publishFeedback(incoming.packet.payload.toString());
	logger.info('CoAP Mote Feedback : ' + incoming.source.address + ':' + incoming.source.port + ': ' + incoming.packet.payload.toString());
}


function coapServer(logger, mqtt, coapClient){
    //var coapClient = require('./coapClient')(logger,mongo,mqtt);
    
    server.bind(port, function() {
      logger.info('UDP is rocking on port: %s',port);
    });

    server.on('message', function(data, rinfo) {
      var req = {source: rinfo, packet: parse(data)};
      //res will be generated elsewhere
      //var res = {source: rinfo, packet: parse(data)};
      req.packet.token = req.packet.token.toString();
      req.packet.payload = req.packet.payload.toString();

	  switch (getPacketType(req)) {
      case 'ACK':
      case 'RST':
    	  break;
      case 'PNG':
    	  //invoke  ping
    	  handlePingRequest(req);
    	  break;
      case 'RER':
    	  //do register response
    	  handelRegisterResponse(req, mqtt);
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
    	  handleFeedbackResponse(req,mqtt)
    	  break;
      default:
    	  //UKN stuff
    	  logger.info('CoAP Unknown Received: ' + req.source.address + ':' + req.source.port + ': ' + req.packet.payload.toString());
      }
    });

    mqtt.on('slimjan/rules', function(data){
		postInstructions(data);
	});

}

module.exports = coapServer;
