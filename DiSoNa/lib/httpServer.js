'use strict';
var restify = require("restify");
var httpRoutes = require('./httpRoutes');
var config = require('../config.js');

var httpServer = function(logger, mongo){
    //TODO add functionality for HTTPS
    var server = restify.createServer();
    server.pre(restify.pre.sanitizePath());
    
    //TODO: add as needed
    restify.CORS.ALLOW_HEADERS.push('accept');
    restify.CORS.ALLOW_HEADERS.push('sid');
    restify.CORS.ALLOW_HEADERS.push('lang');
    restify.CORS.ALLOW_HEADERS.push('origin');
    restify.CORS.ALLOW_HEADERS.push('withcredentials');
    restify.CORS.ALLOW_HEADERS.push('x-requested-with');
    
    config.http_port = process.env.PORT || config.http_port;
    
    // http params
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restify.fullResponse());
    
    httpRoutes(server,logger,mongo);
    server.listen(config.http_port,function(){
        logger.info('HTTP is screaming on: %s',server.url);
    });
};

module.exports = httpServer;