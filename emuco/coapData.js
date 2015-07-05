/**
 * New node file
 */
'use strict'
var util            = require('util')
, events          = require('events')
, copac      = require('coap-packet')
, generate    = copac.generate
, parse 	  = copac.parse;

function coapData(packet, rinfo){
	this._packet = packet;
	this._rinfo = rinfo;
	this.method = getMethod(packet.code);
	this.CON = packet.confirmable;
	this.ACK = packet.ack;
	this.RES = packet.reset;
	this.hostAddress = rinfo.address;
	this.hostPort = rinfo.port;
	this.payload = packet.payload.toString();
	this.path = '/';
	
	this._parseOptions(packet.options);
}

coapData.prototype._parseOptions = function parseOptions(options){
	var that = this;
	options.forEach(function(item){
		switch (item.name) {
		case 'Uri-Path': 
			that.path = '/' + item.value.toString().replace(/\u0000/g,'');
			break;
		case 'Content-Format':
			that.contentFormat = that._contentFormatToString(item.value);
		default:
			break;
		}
	})
}

coapData.prototype._contentFormatToBuffer = function contentFormatToBuffer(data){
	var val;
	switch (data) {
	case 'text/plain': val = 0; break;
	case 'application/link-format': val = 40; break;
	case 'application/xml': val = 41; break;
	case 'application/octet-stream': val = 42; break;
	case 'application/exi': val = 47; break;
	case 'application/json': val = 50; break;
	default: val = 0;
	}
	return new Buffer([val]);
}

coapData.prototype._contentFormatToString = function contentFormatToString(data){
	var val = data.toString();
	var str;
	switch (val) {
	case 0 : str = 'text/plain'; break;
	case 40: str = 'application/link-format'; break;
	case 41: str = 'application/xml'; break;
	case 42: str = 'application/octet-stream'; break;
	case 47: str = 'application/exi'; break;
	case 50: str = 'application/json'; break;
	default: str = 'text/plain';
	}
	return str;
}

coapData.prototype.generateACK = function generateACK(){
	var ack = {
		code: '0.00',
		ack: true,
		messageId: this._packet.messageId,
	}
	console.log(ack);
	return copac.generate(ack);
}

coapData.prototype.post = function Post (path, callback){
	//at this point not handling any query info
	//just callback
	if(path === this.path) callback(null);
	else return;
}

coapData.prototype.getResponse = function getResponse(data, callback){
	if(!data.code) callback({error: 'missing code'});
	var packet = {
		code: data.code,
		confirmable: true,
		messageId: this._packet.messageId,
		token: this._packet.token,
		options: []
	};
	if(data.payload) packet.payload = new Buffer(JSON.stringify(data.payload));
	
	
	if(data.contentFormat) 
		packet.options.push({name: 'Content-Format', value: this._contentFormatToBuffer(data.contentFormat)});
	
	callback(null,packet);
}

function getMethod(code){
	switch (code){
		case '0.00': return 'undefined';
		case '0.01': return 'GET';
		case '0.02': return 'POST';
		case '0.03': return 'PUT';
		case '0.04': return 'DELETE';
		default: return 'unknown';
	}
}

module.exports = coapData;