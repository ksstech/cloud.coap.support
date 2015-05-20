'use strict';
//var coapClient = require('./coapClient.js');

function httpRoutes(server, logger, mongo){

    ///////////////////////////////////////////
    //GET /
    server.get('/', function(req, res){
        
        res.json(201,{message: 'on-line'})
    });
    
    ///////////////////////////////////////////
    //GET /active
}

module.exports = httpRoutes;