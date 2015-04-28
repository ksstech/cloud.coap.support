'use strict';
var restify = require("restify");
var httpRoutes = require('./httpRoutes');

var httpServer = function(config,mqtt){
    var thatMqtt = mqtt;
    //TODO add functionality for HTTPS
    var server = restify.createServer();
    server.pre(restify.pre.sanitizePath());
    
    //TODO: add as needed
    restify.CORS.ALLOW_HEADERS.push('auth_uuid');
    restify.CORS.ALLOW_HEADERS.push('auth_token');
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
    server.use(restify.CORS({ headers: [ 'auth_uuid', 'auth_token' ], origins: ['*:*'] }));
    server.use(restify.fullResponse());
    
    httpRoutes(server,config);
    server.listen(config.http_port,function(){
        console.log('HTTP is screaming on: %s',server.url);
        thatMqtt.publishCustom('disona.started','started', {});
    });
};

module.exports = httpServer;