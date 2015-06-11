'use strict';
var winston = require('winston');
var config = require('./config.js');
//var data = require('./lib/activeMotes.js');
var mqttServer = require('./lib/mqttServer');
var coapClient = require('./lib/coapClient');
//TODO: add program(commander) options

////////////////////////////////////
//STARTING UP
////////////////////////////////////
console.log("");
console.log("DDD          SSSS        N   N ");
console.log("D  DD   I   S        O   NN  N    A");
console.log("D    D  I    SSS    O O  N N N   AAA");
console.log("D  DD   I       S    O   N  NN  A   A");
console.log("DDD         SSSS         N   N");
console.log("                              ");
console.log('Starting ze service...');
console.log("");

//start up logging
/////////////////////////////////
var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({ handleExceptions: true, timestamp: true}),
    new winston.transports.DailyRotateFile({ filename: 'disona.log', handleExceptions: true, timestamp: true })
  ],
  exitOnError: false
});
if (config.logging.file == false) logger.remove(winston.transports.File);
if (config.logging.console == false) logger.remove(winston.transports.Console);
logger.info('Logger is humming...');

//start up activeMote service
//////////////////////////////////////
var activeMotes = require('./lib/activeMotes')();
//console.log(activeMotes);
// start mqtt
var mqtt = new mqttServer(logger);

var cC = new coapClient(logger,activeMotes,mqtt); 
//start coap
var coapServer = require("./lib/coapServer")(logger, activeMotes, mqtt, cC);

//start http
var httpServer = require('./lib/httpServer')(logger, activeMotes);

//var disonaServer = require('./lib/disonaServer.js')(config,mqttServer);


