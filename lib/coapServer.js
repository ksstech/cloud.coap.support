'use strict';
/////////////////////////////////////////
//Use for devices to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var config = require('../config.js');
var coapRoutes = require('./coapRoutes');

function coapServer(logger, mongo, mqtt){
    var coapRouter = require('./coapRouter');
    var coapServer = coap.createServer();
    
    coapRoutes(coapRouter,logger, mongo, mqtt);
    //coapServer.on('request', coapRouter.process);
    coapServer.on('request', process);
    coapServer.on('error', console.error);
    
    config.coap_port = config.coap_port || 5683;
    coapServer.listen(config.coap_port,"0.0.0.0",function(){
        logger.info('CoAP is rocking on: coap://0.0.0.0:%s',config.coap_port);
    });
    
    function process(req,res){
        var method = req.method;
        var url = req.url;
        console.log(req);
        var payload = req.payload.toString();
        console.log(method);
        console.log(url);
        console.log(payload);
        res.setOption("Content-Format", "application/json");
        res.statusCode = 204;
        res.end(JSON.stringify({message: 'acknowledge'}));
    }
}

module.exports = coapServer;