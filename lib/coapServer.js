'use strict';
/////////////////////////////////////////
//Use for devices to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var coapRoutes = require('./coapRoutes');

function coapServer(config){
    var coapRouter = require('./coapRouter');
    var coapServer = coap.createServer();
    
    coapRoutes(coapRouter,config);
    coapServer.on('request', coapRouter.process);
    coapServer.on('error', console.error);
    
    config.coap_port = config.coap_port || 5683;
    
    coapServer.listen(config.coap_port,"0.0.0.0",function(){
        console.log('CoAP is rocking on: coap://0.0.0.0:%s',config.coap_port);
    });
}

module.exports = coapServer;