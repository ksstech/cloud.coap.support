/**
 * MWP 20150710
 * httpServer: restify service for handling http web service requests
 */
var restify 	= require('restify');
var settings 	= require('../settings');
var httpRoutes 	= require('./httpRoutes');

function httpServer(logger){
	
	var server = restify.createServer();
    server.pre(restify.pre.sanitizePath());
    
    // http params
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restify.fullResponse());
    
    httpRoutes(server,logger);
    server.listen(settings.http.port,function(){
        logger.logInfo('HTTP is screaming on port ' + settings.http.port);
    });
    
    server.on('uncaughtException', function(req, res, route, err){
    	logger.logHttpServerError(err);
    });
}

module.exports = httpServer;