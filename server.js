/**
 * MWP 20150710
 * slimJan nodejs webservice entry point
 */
var winston = require('winston');
var config = require('./config.js');
var httpServer = require('./lib/httpServer');
var amqpServer = require('./lib/amqpServer');
var slimjanServer = require('./lib/slimjanServer');
////////////////////////////////////
//STARTING UP
////////////////////////////////////
console.log("");
console.log(" SSSS   L                JJJJJ");
console.log("S       L   I    MMMMM       J     AAA    NNN");
console.log(" SSS    L   I    M M M       J    A  A    N  N");
console.log("    S   L   I    M   M   J   J     AAA    N  N");
console.log("SSSS    L                 JJJ");
console.log("                              ");
console.log('Starting ze service...');
console.log("");

//start up logging
/////////////////////////////////
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({handleExceptions: true, timestamp: true}),
    new (winston.transports.File)({ filename: 'slimjan.log', handleExceptions: true, maxsize:10000000, tailable:true, maxFiles: 10, json: false, timestamp: true })
  ],
  exitOnError: false
});
if (config.logging.file == false) logger.remove(winston.transports.File);
if (config.logging.console == false) logger.remove(winston.transports.Console);
logger.info('Logger is humming...');

//HTTP Server
var http = httpServer(logger);

var amqp = new amqpServer(logger);

var slimjan = slimjanServer(amqp, logger);

process.on('uncaughtException', function(){
	console.log('closing');
});
