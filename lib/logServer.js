/**
 * MWP 20150710
 * logServer: module for instantiating and handling logging with Winston as backbone
 */
var winston = require('winston');

function logServer(){
	this._winston = new (winston.Logger)({
		transports: [
             new winston.transports.Console({ handleExceptions: true, timestamp: true}),
             new winston.transports.DailyRotateFile({ filename: 'slimJan.log', handleExceptions: true, timestamp: true })
         ],
         exitOnError: false
	});
	this.logInfo('logServer is up and logging');
}

logServer.prototype.logInfo = function logInfo(data){
	this._winston.info(data);
}

logServer.prototype.logError = function logError(data){
	this._winston.error(data);
}

logServer.prototype.logHttpServerError = function logHttpServerError(err){
	this._winston.error('HTTP Server: ', err);
}

logServer.prototype.logHttpReqError = function logHttpReqError(req, err){
	this._winston.error('HTTP Request From ' + req.connection.remoteAddress + ' to ' + req.url + ': ' + err.statusCode + ' ' + err.message);
}

logServer.prototype.logHttpReq = function logHttpReq(req){
	this._winston.info('HTTP ' + req.method + ' Request From ' + req.connection.remoteAddress + ' to ' + req.url + ': ' + JSON.stringify(req.body.toString()));
}

module.exports = logServer;
