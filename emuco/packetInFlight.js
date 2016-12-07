/**
 * New node file
 */
var settings = require('./settings')
, util            = require('util')
, async = require('async')
, copac      = require('coap-packet')
, generate    = copac.generate
, events          = require('events');

function packetInFlight(socket, port, address, type, coapPacket){
	if (!(this instanceof packetInFlight))
	    return new packetInFlight();
	this.type = type;
	this.retries = 0;
	this.ack = false;
	this.id = coapPacket.messageId;
	this.packet = coapPacket;
	this.address = address;
	this.port = port;
	this._socket = socket;
	this._buf = generate(coapPacket);
	this._currentTime = settings.ackTimeout * (1 + (settings.ackRandomFactor - 1) * Math.random()) * 1000
	
	var that = this;
	
	this._resend = function () {
		that.retries++;
		that._currentTime = that._currentTime * 2;
		if( that.ack === false) that._send();
	}
	
	this._send();
	
}

util.inherits(packetInFlight, events.EventEmitter);

packetInFlight.prototype._send = function send(){
	var that = this;
	if(this.retries < settings.maxRetransmit) {
		console.log ('retry %s of %s for %s seconds for %s', that.retries, settings.maxRetransmit, that._currentTime, that.id)
		that._socket.send(that._buf, 0, that._buf.length, that.port, that.address);
		that._resendTimer = setTimeout(that._resend, that._currentTime);
	} else {
		that.emit('timeout', that.id);
	}
}

module.exports = packetInFlight;