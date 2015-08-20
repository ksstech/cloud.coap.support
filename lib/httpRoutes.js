/**
 * MWP 20150710
 * httpRoutes: module for groutping thr routing functions on http
 */
'use strict';
var restify 	= require('restify');
var settings 	= require('../settings');
var fs 			= require('fs');
var helpers 	= require('./helpers');
var async		= require('async');

//Class: 	httpRequests: handle all server requests
//Params: 	server: restify server
//			logger: logServer object
function httpRoutes(server, logger){
	//POST:		/splitSenseaAggregate
	//Post:		/rules
	//Require:	Content-Type: application/json
	//			Body must have well formed sense data
	//Return:	Content-Type: application/json
	//			array of sense data
	server.post('/splitSenseValues', function(req,res,next){
		var data = req.body;
		//check content-type
		if(!req.body){
			xerr = new restify.InvalidContentError('Expected payload not found');
			logger.logHttpReqError(req ,xerr);
			return next(xerr);
		}
		if(!req.is('json')){
			var xerr = new restify.InvalidContentError('Expected Content-Type: application/json');
			logger.logHttpReqError(req ,xerr);
			return next(err);
		} else {
			//now load the file
			logger.logHttpReq(req);
			//check for d_id
			var xerr = null;
			if(!data.d_id) {
				xerr = new restify.InvalidContentError('Expected d_id not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			} else if (!data.bn){
				xerr = new restify.InvalidContentError('Expected bn not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			} else if (!data.cat){
				xerr = new restify.InvalidContentError('Expected cat not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			} else if (!data.bt){
				xerr = new restify.InvalidContentError('Expected bt not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			} else if (!data.e.n){
				xerr = new restify.InvalidContentError('Expected e.n not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			} else if (!data.e.u){
				xerr = new restify.InvalidContentError('Expected e.u not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			} else if (!data.e.v){
				xerr = new restify.InvalidContentError('Expected e.v not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			}
			//build up new array
			var timeIteration = data.bt - data.e.v.length + 1;
			var returnVal = "";
			data.e.v.forEach(function(item){
				var senseValue = data.e.n + ',';
				senseValue += 'd_id=' + data.d_id + ' ';
				senseValue += 'v1=' + item + ' ';
				senseValue += data.bt + '\n';
				
				returnVal += senseValue;
				timeIteration++;
			});
			res.code = 200;
			res.contentType = 'text/plain';
			res.charSet('utf-8');
        	res.send(returnVal);
        	return next();
			
		}
	});
	
	//Require:	Content-Type: application/json
	//			Body must have at least d_id and d_hw
	//Return:	Content-Type: application/json
	//			d_id, rules, sense, probe
	server.post('/rules', function (req,res,next){
		//check content-type
		if(!req.is('json')){
			var xerr = new restify.UnsupportedMediaTypeError('Expected Content-Type: application/json');
			logger.logHttpReqError(req ,xerr);
			return next(err);
		}
		else {
			//now load the file
			logger.logHttpReq(req);
			//check for d_id
			if(!req.body.d_hw) {
				var xerr = new restify.InvalidContentError('Expected d_hw not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			//check for d_hw
			} else if (!req.body.d_id) {
				var xerr = new restify.InvalidContentError('Expected d_id not found');
				logger.logHttpReqError(req ,xerr);
				return next(xerr);
			} else {
				var xerr;
				//use async to fetch rules data for sense, probe and rules
				async.parallel({
					sense: function (callback){
						helpers.getRules(req.body.d_hw, 'sense', function cbSense(err, data){
							callback(err,data);
						});
					},
					rules: function (callback){
						helpers.getRules(req.body.d_hw, 'rules', function cbRules(err, data){
							callback(err,data);
						});
					},
					probe: function (callback){
						helpers.getRules(req.body.d_hw, 'probe', function cbProbe(err, data){
							callback(err,data);
						});
					}
				}, 
				function (err, results){
					if (err) {
						xerr = new restify.InternalServerError('rule set not available.');
						logger.logHttpReqError(req ,err);
						res.send(xerr);
						return next();
					} else {
						var data = {
							d_id: req.body.d_id, 
							rules: results
						};
		            	res.code = 200;
		            	res.json(data);
		            	return next();
					}
				});
			}
			return next('');
		}
	});
}

module.exports = httpRoutes;
