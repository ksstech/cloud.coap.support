/**
 * New node file
 */
'use strict'
var util            = require('util')
, events          = require('events')

function request(type, options){
  if (!(this instanceof request))
	    return new request();
  this._options = options;
  this.packet = {};
  this.type = '';
  this.to = {};
  if(type === 'ping') this._initPing();
  else if(type === '405') this._init405();
}

util.inherits(request, events.EventEmitter)

request.prototype._initPing = function initPing(){
	this.type = 'ping';
	this.packet.code = '0.00';
	this.packet.confirmable = true;
	if(this._options.messageId) this.packet.messageId = this._options.messageId;
	if(this._options.toAddress) this.to.address = this._options.toAddress;
	if(this._options.toPort) this.to.port = this._options.toPort;
}

request.prototype._init405 = function init405(){
	this.type = '405';
	this.packet.code = '4.05';
	this.packet.confirmable = false;
	this.packet.reset = true;
	this.packet.payload = new Buffer('method not allowed');
	if(this._options.messageId) this.packet.messageId = this._options.messageId;
	if(this._options.token) this.packet.token = this._options.token;
	if(this._options.toAddress) this.to.address = this._options.toAddress;
	if(this._options.toPort) this.to.port = this._options.toPort;
}

module.exports = request;
