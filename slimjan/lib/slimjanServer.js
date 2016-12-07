'use strict'
var async = require('async');
var helpers 	= require('./helpers');

function slimjanServer(amqp, logger) {
  //Require:	Content-Type: application/json
	//			Body must have at least d_id and d_hw
	//Return:	Content-Type: application/json
	//			d_id, rules, sense, probe
	amqp.on(amqp.receiveRegister, function (data){
		//check content-type
		if(data !== null){

			//now load the file

			//check for d_id
			if(!data.d_hw) {
				var xerr = ('Expected d_hw not found');
				logger.error('AMQP: ' + xerr);
				return next(xerr);
			//check for d_hw
			} else if (!data.d_id) {
				var xerr = ('Expected d_id not found');
        logger.error('AMQP: ' + xerr);
				return next(xerr);
			} else {
				var xerr;
				//use async to fetch rules data for sense, probe and rules
				async.parallel({
					sense: function (callback){
						helpers.getRules(data.d_id, data.d_hw, 'sense', function cbSense(err, info){
							callback(err,info);
						});
					},
					rules: function (callback){
						helpers.getRules(data.d_id, data.d_hw, 'rules', function cbRules(err, info){
							callback(err,info);
						});
					},
					probe: function (callback){
						helpers.getRules(data.d_id, data.d_hw, 'probe', function cbProbe(err, info){
							callback(err,info);
						});
					}
				},
				function (err, results){
					if (err) {
						xerr = (data + ': rule set not available.');
						logger.error('AMQP: ' + xerr + ' -> ' + err);
						return next();
					} else {
						var ruleData = {
							d_id: data.d_id,
							rules: results
						};
            //console.log(ruleData);
                  amqp.publishRegister(ruleData);
					}
				});
			}
		}
	});
}

module.exports = slimjanServer;
