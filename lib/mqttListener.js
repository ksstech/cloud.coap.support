/**
 * New node file
 */
var coapClient = require('./coapClient');

function mqttListener(server, active, logger){
	var cc = new coapClient(logger);

	server.on('slimjan/rules', function(data){
		logger.info('MQTT: slimjan.rules: ' + data);
		//validate data
		if(!data.d_id) logger.error('MQTT: slimjan.rules: no d_id');
		else if(!data.rules) logger.error('MQTT: slimjan.rules: no rules');
		else {
			//check if d_id exist
			active.getOne(data.d_id, function (err, mote){
				if (err) logger.error('MQTT: slimjan.rules: mote ' + data.d_id + ' not active');
				else {
					//send the rules
					cc.postRules(mote, data.rules.toString(), function (err){
						if (err) logger.error(err);
					});
				}
			});
		}
	});
}

module.exports = mqttListener;
