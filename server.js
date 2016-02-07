'use strict';
var winston = require('winston');
var config = require('./config.js');
var amqpServer = require('./lib/amqpServer');
var fluxator = require('./lib/fluxator');
//TODO: add program(commander) options

////////////////////////////////////
//STARTING UP
////////////////////////////////////
console.log("");
console.log("FFFFF L     U   U X   X   A   TTTTT  OOO  RRRR");
console.log("F     L     U   U  X X   A A    T   O   O R   R");
console.log("FFF   L     U   U   X   A   A   T   O   O RRRR");
console.log("F     L     U   U  X X  AAAAA   T   O   O R  R");
console.log("F     LLLLL  UUU  X   X A   A   T    OOO  R   R");
console.log("                              ");
console.log('Starting ze service...');
console.log("");

//start up logging
/////////////////////////////////
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({handleExceptions: true, timestamp: true}),
    new (winston.transports.File)({ filename: 'fluxator.log', handleExceptions: true, maxsize:300000000, maxFiles: 10, json: false, timestamp: true })
  ],
  exitOnError: false
});
if (config.logging.file == false) logger.remove(winston.transports.File);
if (config.logging.console == false) logger.remove(winston.transports.Console);
logger.info('Logger is humming...');

var amqp = new amqpServer(logger);

//start fluxator
var cS = fluxator(amqp, logger);
