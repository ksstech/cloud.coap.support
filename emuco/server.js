/**
 * coap server file
 */

var request = require('./request')
, coapData = require('./coapData')
, dgram       = require('dgram')
, util            = require('util')
, events          = require('events')
, packet      = require('coap-packet')
, generate    = packet.generate
, parse 	  = packet.parse
, maxToken        = Math.pow(2, 32)
, maxMessageId    = Math.pow(2, 16)
, async = require('async')
, inFlight = require('./packetInFlight');

var settings = {
	disona: {ip: '0.0.0.0', port: 5683},
	server: {port: 5693, type: 'udp4'},
	pingTime: 5000,
	mote: {
		register: {
			code: '2.05',
			contentFormat: 'application/json',
			payload: {
				d_id: 'vMote1',
				d_hw: 'LP',
				d_sw: 'MWP-VMOTE-V001',
				d_mf: 'BF233-12F'
			}
		},
		rules: {
			code: '2.04'
		}
	}
};

function imacsMote(settings){
  if (!(this instanceof imacsMote))
	    return new imacsMote();

  if (!settings) opts = {};

  this._settings = settings;
  
  this._init();
}

util.inherits(imacsMote, events.EventEmitter)

imacsMote.prototype._init = function initMote(){
	if(this._server) return;
	
	var that = this;
	
	
	this._msgInFlight = 0;
	this._lastToken = Math.floor(Math.random() * (maxToken - 1));
	this._lastMessageId = Math.floor(Math.random() * (maxMessageId - 1));

	this._server = dgram.createSocket(this._settings.server.type, function (msg, rinfo){that._handle(msg,rinfo);});
	this._server.bind(that._settings.server.port, function() {
	    console.log('imacsMote %s is rocking on port: %s', that._settings.mote.register.payload.d_id, that._settings.server.port);
	    that.emit('ready');
	});
	this._msgsInProgress = {};
	this._server.on('error', function(err){
		console.log(err);
	});

	this._server.on('close', function(){
		
	});
		
	  
	
	
}

imacsMote.prototype._handle = function handle(msg, rinfo){
	var packet;
	try {
		packet = parse(msg)
    } catch(err) {
		var message = generate({ code: '5.00', payload: new Buffer('Unable to parse packet') })
		this._server.send(message, 0, message.length, rinfo.port, rinfo.address)
		console.log(err);
		return;
    }
	//console.log('Msg from Disona');
	//console.log(this._msgsInProgress);
	var req = this._msgsInProgress[packet.messageId];
	var cd = new coapData(packet, rinfo);
	var that = this;
	console.log('Incoming:');
	console.log(packet);
	if(req){
		console.log('Rsp from disona');
		that._msgInFlight--;
		req.ack = true;
		delete that._msgsInProgress[packet.messageId];
		if(req.type === 'ping'){
			console.log('ping ack');
			if(packet.ack === true) req.emit('ACK');
		}
	} else {
		//request from outside
		if (cd.ACK || cd.RES) return;
		if (cd.CON) {
			console.log('Outgoing:');
			var message = cd.generateACK();
			that._server.send(message, 0, message.length, cd.hostPort, cd.hostAddress)
		}
		if(cd.method === 'GET') this._get(cd);
		else if (cd.method === 'POST') this._post(cd);
		else if (cd.method === 'PUT') this._put(cd);
		else if (cd.method === 'DELETE') this._delete(cd);
		else {
			console.log(cd);
		}
	}
	
}

imacsMote.prototype._send = function send(port, address, type, coapPacket){
	var that = this;
	var inflight = new inFlight(this._server, port, address, type, coapPacket);
	console.log('Outgoing:');
	console.log(coapPacket);
	if(coapPacket.confirmable) { 
		this._msgInFlight++;
		this._msgsInProgress[coapPacket.messageId] = inflight;
	}
	inflight.on('timeout', function (messageId){
		var tmoInFlight = that._msgsInProgress[messageId];
		delete that._msgsInProgress[messageId];
		that._msgInFlight--;
		console.log('Response timeout to %s:%s', tmoInFlight.address, tmoInFlight.port);
	});
}

imacsMote.prototype._nextToken = function nextToken() {
  var buf = new Buffer(4);
  if (++this._lastToken === maxToken) this._lastToken = 0;
  buf.writeUInt32BE(this._lastToken, 0);
  return buf;
}

imacsMote.prototype._nextMessageId = function nextMessageId() {
  if (++this._lastMessageId === maxMessageId)
	  this._lastMessageId = 1;
  return this._lastMessageId;
}

imacsMote.prototype._ping = function ping(timeout, callback){
	var packet = {
		code: '0.00',
		confirmable: true,
		messageId: this._nextMessageId(),
	};
	var that = this;
	if(this._msgInFlight === 0){
		//console.log(req.packet);
		var req = that._msgsInProgress[packet.messageId] = new inFlight(that._server, that._settings.disona.port, that._settings.disona.ip, 'ping', packet, that._handleTimeout);
		this._msgInFlight++;
	}
	//console.log(this._msgsInProgress);
	req.on('ERR', function(err){callback(err);});
	req.on('ACK', function(){
		callback(null,'ACK');
	});
	req.on('timeout', function(messageId){
		var tmoInFlight = that._msgsInProgress[messageId];
		delete that._msgsInProgress[messageId];
		that._msgInFlight--;
		console.log('Response timeout to %s:%s', tmoInFlight.address, tmoInFlight.port);
		callback(null,'TMO');
	});
}

imacsMote.prototype.start = function start(){
	//start process by pinging
	var that = this;
	var pong = 0;
	async.whilst(
		function() {return pong < 1;},
		function(callback){
			console.log('Ping to Disona');
			that._ping(5,function pingRet(err,state){
				if(err) callback(err);
				else {
					if(state === 'ACK') {
						console.log('Pong from Disona');
						pong = 1;
					} else if (state == 'TMO') {
						console.log('TMO from Disona');
					}
					callback(null);
				}
			});
		},
		function (err) {
			if(err) console.log(err);
		}
	);
}

imacsMote.prototype._get = function get(coapData){
	var opts = {
		messageId: packet.messageId,
		token: packet.token,
		toAddres: rinfo.address,
		toPort: rinfo.port
	};
	//no method yet
	var req = new request('405',opts);
	var buf = generate(req.packet);
	this._server.send(buf,0,buf.length, opts.toPort, opts.toAddress,function getSend(err){
		if (err) console.log(err);
	});
}

imacsMote.prototype._post = function post(coapData){
	//create generic function in coapData to call for a path eg coapData.post('/register', function(params){})
	var that = this;
	console.log(coapData);
	coapData.post('/register', function(params){
		console.log('register response');
		coapData.getResponse(that._settings.mote.register, function (err,packet){
			if(err) console.log(err);
			else that._send(coapData.hostPort, coapData.hostaddress, 'response', packet);
		});
	});
	coapData.post('/rules', function(params){
		console.log('rules response');
		coapData.getResponse(that._settings.mote.rules, function (err,packet){
			if(err) console.log(err);
			else that._send(coapData.hostPort, coapData.hostaddress, 'response', packet);
		});
	});
}

imacsMote.prototype._put = function put(coapData){
	
}

imacsMote.prototype._delete = function dodelete(coapData){
	
}
//need to stopp if pong is received. then wait for reg. if none is forthcoming in 5 seconds start ping again


var server = new imacsMote(settings);
server.on('ready', function(){
	server.start();
});






