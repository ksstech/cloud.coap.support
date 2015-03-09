'use strict';

module.exports = {
    logHttpRequest: logHttpRequest,
    logHttpResponse: logHttpResponse,
    logCoapRequest: logCoapRequest,
    logCoapResponse: logCoapResponse
};

function logHttpRequest(request){
   //console.log(request);
    var event = {
        timeStamp: new Date(),
        messageId: request.messageId,
        protocol: 'http',
        direction: 'request',
        method: request.route.method,
        address: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
        url: request.route.path,
        payload: request.body
    };
    insertEvent(event);
}

function logHttpResponse(response){
    var event = {
        timeStamp: new Date(),
        messageId: response.messageId,
        protocol: 'http',
        direction: 'response',
        code: response.statusCode,
        payload: response._body
    };
    insertEvent(event);
}

function logCoapRequest(request){
    //console.log(request);
    var event = {
        timeStamp: new Date(),
        messageId: request._packet.messageId,
        protocol: 'coap',
        direction: 'request',
        method: request.method,
        address: request.rsinfo.address,
        port: request.rsinfo.port,
        url: request.url,
        payload: request.payload.toString()
    };
    
    insertEvent(event);
}

function logCoapResponse(response){
    //console.log(response); 
    var event = {
        timeStamp: new Date(),
        messageId: response._packet.messageId,
        protocol: 'coap',
        direction: 'response',
        code: response._packet.code,
        payload: response._bufs[0].toString()
    };
    insertEvent(event);
}

function insertEvent(event){
    var eventLog = require("./data.js").events;
    eventLog.insert(event,function(err){
        if(err) console.log(err);
    });
}

