'use strict';
/////////////////////////////////////////
//Use for motes to communicate to the cloud
//EG Registration, requestion updates etc
/////////////////////////////////////////
var coap = require("coap");
var config = require('../config.js');
var qs    = require('qs');
var fs = require('fs');
var coapClient = require('./coapClient.js');
var addresses = {};

function coapServer(logger, mongo, mqtt){
    var coapRouter = require('./coapRouter');
    var coapServer = coap.createServer();
    
    //coapServer.on('request', coapRouter.process);
    coapServer.on('request', process);
    coapServer.on('error', logger.error);
    
    config.coap_port = config.coap_port || 5683;
    coapServer.listen(config.coap_port,"0.0.0.0",function(){
        logger.info('CoAP is rocking on: coap://0.0.0.0:%s',config.coap_port);
    });
    
    function sendPort(data,port){
	var url = {};
	url.hostname = data.clientAddres;
	url.port = data.clientPort;
	url.method = 'POST';
	url.pathname = '/port';
	logger.info(url);
	var req = coap.request(url);
	req.setOption('Content-Format','application/json');
	req.end(JSON.stringify({port: port}));
	logger.info(port);
	logger.info(url);
	req.on('response',function(res){
	   logger.info(res.payload.toString());
	});

	req.on('error', function(err){
	   logger.error('sendPort' + err);
	});
    }

    function process(req,res){
        var data = {};
        logger.info(req.rsinfo);
        data.method = req.method;
        data.url = req.url.replace(/\u0000/g,'');
        data.payload = req.payload.toString();
        data.clientAddres = req.rsinfo.address;
        data.clientPort = req.rsinfo.port;
        data.socket = req.rsinfo;
        logger.info({rsinfo: req.rsinfo});
        logger.info({outSocket: req.outSocket});
        data.content = formatContent(data.payload);
        data.confirm = req._packet.confirmable;
        if(req.headers['Content-Format'] || req.headers['Content-Type']) 
            data.contentFormat = req.headers['Content-Format'] || req.headers['Content-Type'];
        else
            data.contentFormat = 'application/json';
        route(data,res);
    }
    
    function route(data,res){
        /////////////////////////////
	///FIRST PING
	logger.info('socket: ' + data.socket + ' method: ' + data.method + ' url: ' + data.url);
	//if(data.socket.port === 5683 && data.method === undefined && data.url === '/'){
	if(data.clientPort != 49152 && data.method === undefined && data.url === '/'){
		//assign port
		logger.info('ping received:' + data);
		sendPort(data,49152);
                if(addresses(data.url)){
			sendPort(data,addresses(data.url));
			addresses(data.url)++;
		} else {
			addresses.set(data.url,49152);
			sendPort(data,addresses(data.url));
			addresses(data.url)++;
		}
	}

	/////////////////////////////
        //GET /
        if(data.method === 'get' && data.url === '/'){
            resJSON(data,res,205,{message: 'on-line'});res.statusCode = 205;
        }
        //////////////////////////////
        //POST /register
        else if(data.method === 'post' && data.url === '/register'){
            mongo.registerMote(data.clientAddres,data.clientPort,data.content, function (err, mote){
                if(err) resJSON(data,res, 402, err);
                else {
                    mqtt.publishRegister(mote);
                    //read rules from file
                    
                    //var fname =  '/home/marsel/rules/' + mote.d_hw;
                    //var fname =  '/home/ubuntu/rules/' + mote.d_hw;
                    var fname =  'rules/' + mote.d_hw;
                    fs.readFile(fname, {encoding: 'utf-8'}, function(err,rules){
                        if(err) resJSON(data,res, 402, err);
                        else resText(data,res, 202, rules);
                    });
                }
            });
        }
        /////////////////////////////
        //POST /sense
        else if(data.method === 'post' && data.url === '/sense'){
	    logger.info(data);
            mongo.refreshMote(data.content, function(err){
                if(err) logger.error(err);
                else {
                    mqtt.publishSense(data.content);
                    resJSON(data,res, 204, {message: 'acknowledged'});
                }
            });
        }
        ////////////////////////////
        //POST /alert
        else if(data.method === 'post' && data.url === '/alert'){
            mongo.refreshMote(data.content, function(err){
                if(err) resJSON(data,res, 402, err);
                else {
                    mqtt.publishAlert(data.content);
                    resJSON(data,res, 204, {message: 'acknowledged'});
                }
            });
        }
        
        else {
            resJSON(data,res,404,{message: 'unknown resource'});   
        }
    }
    
    function resJSON(req, res,code,sendData){
        res.setOption("Content-Format", "application/json");
        res.statusCode = code;
        logger.info(req.confirm);
        logRequest(req,res,JSON.stringify({confirm: req.confirm}));
        if(req.confirm) {
             res.end(JSON.stringify(sendData));
             logRequest(req,res, JSON.stringify(sendData));
        }
    }
    
    function resText(req, res,code,sendData){
        res.setOption("Content-Format", "text/plain");
        res.statusCode = code;
        logger.info(req.confirm);
        logRequest(req,res,JSON.stringify({confirm: req.confirm}));
        if(req.confirm) {
             res.end(sendData);
             logRequest(req,res, sendData);
        }
    }
    
    function logRequest(data,res, ret){
        var msg = 'CoAP: Request';
            msg += ': ' + data.method;
            msg += ': ' + data.url;
            msg += ': FROM: ' + data.clientAddres + ':' + data.clientPort;
            msg += ' : payload: ' + data.content;
        logger.info(msg);
        var resp = 'CoAP: Response: ' + res.statusCode + ' : ' + ret;
        logger.info(resp);
        
    }
    
    function formatContent(data){
        try {
            return JSON.parse(data);   
        }
        catch(e) {
            if(e instanceof SyntaxError) {
                return qs.parse(data.toString().replace(/^\/.*\?/g, ''));
            }
            else return {};
        }
    }

}

module.exports = coapServer;
