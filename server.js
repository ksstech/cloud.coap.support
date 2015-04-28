'use strict';
//TODO: add functionality for nodetime
//TODO: add functionality for commander
//TODO: add package.json
var config = require("./config.js");
var mongo = require("mongojs");

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

//start mqtt
var mqtt = require('./lib/mqttServer');
var mqttServer = new mqtt(config);

//start coap
var coapServer = require("./lib/coapServer")(config,mqttServer);

//start http
var httpServer = require('./lib/httpServer')(config,mqttServer);

var disonaServer = require('./lib/disonaServer.js')(config,mqttServer);


