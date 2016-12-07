'use strict';
//var coapClient = require('./coapClient.js');

function httpRoutes(server, logger, mongo){
    
    ///////////////////////////////////////////
    //GET /
    server.get('/', function(req, res){
        res.json(201,{message: 'on-line'});
        logRequest(req,res);
    });
    
    ///////////////////////////////////////////
    //GET /motes/active
    server.get('/motes/active', function(req, res){
        mongo.activeMotes(function(err,data){
            if(err) res.json(401,err);
            else res.json(201,data);
        });
        logRequest(req,res);
    });
    
    function logRequest(req, res){
        //console.log(res);
        var msg = 'HTTP: Request';
        msg += ': ' + req.route.method;
        msg += ': ' + req.route.path;
        msg += ': FROM: ' + req.headers['x-forwarded-for'];
        msg += ' : payload: ' + req._body;
        logger.info(msg);
        var resp = 'HTTP: Response: ' + res.statusCode + ' : ' + res._data;
        logger.info(resp);
    }
}

module.exports = httpRoutes;