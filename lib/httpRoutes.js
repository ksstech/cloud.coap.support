/**
 * MWP 20150710
 * httpRoutes: modile for groutping thr routing functions on http
 */
'use strict';
var restify 	= require('restify');
var settings 	= require('../settings');
var fs = require('fs');

function httpRoutes(server, logger){
	server.post('/rules', function (req,res,next){
		if(!req.is('json')){
			var err = new restify.UnsupportedMediaTypeError('Expected Content-Type: application/json');
			logger.logHttpReqError(req ,err);
			return next(err);
		}
		else {
			//now load the file
			logger.logHttpReq(req);
			if(!req.body.d_hw) {
				var err = new restify.InvalidContentError('Expected d_hw not found');
				logger.logHttpReqError(req ,err);
				return next(err);
			} else {
				var fname;
				try {fname = settings.rules_path + req.body.d_hw;}
				catch (xerr){
					var err = new restify.InternalError(xerr.toString());
	            	logger.logHttpReqError(req ,err);
					return next(err);
				}
		        fs.readFile(fname, {encoding: 'utf-8'}, function(ferr,rules){
		            if(err) {
		            	var err = new restify.InternalError(ferr.toString());
		            	logger.logHttpReqError(req ,err);
						return next(err);
		            } else {
		            	res.header('Content-Type', 'text/plain');
		            	res.charSet('utf-8');
		            	res.code = 200;
		            	res.send(rules);
		            	return next();
		            }
		        });
			}
			return next('');
		}
	});
}

module.exports = httpRoutes;
