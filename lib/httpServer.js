'use strict';
var restify = require("restify")
var httpRoutes = require('./httpRoutes');

var httpServer = function(config){
    //TODO add functionality for HTTPS
    var server = restify.createServer();
    server.pre(restify.pre.sanitizePath());
    
    //TODO: add as needed
    restify.CORS.ALLOW_HEADERS.push('auth_uuid');
    restify.CORS.ALLOW_HEADERS.push('auth_token');
    
    config.http_port = process.env.PORT || config.http_port;
    
    // http params
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restify.CORS({ headers: [ 'auth_uuid', 'auth_token' ], origins: ['*:*'] }));
    server.use(restify.fullResponse());
    
    httpRoutes(server,config);
    server.listen(config.http_port,function(){
        console.log('HTTP is rocking on: %s',server.url);
    })
    
}

module.exports = httpServer;