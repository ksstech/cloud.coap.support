/**
 * MWP 20150710
 * slimJan nodejs webservice entry point
 */
var logServer = require('./lib/logServer');
var httpServer = require('./lib/httpServer');
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

//Winston - logging
var logger = new logServer();

//HTTP Server
var http = httpServer(logger);

process.on('uncaughtException', function(){
	console.log('closing');
});
