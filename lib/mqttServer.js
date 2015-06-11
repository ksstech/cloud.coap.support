'use strict';
var config = require('../config.js');
var mqtt    = require('mqtt');

function log(topic, msg){
    var date = new Date();
    console.log('[MQTT][%s][%s][%s] %s: %s', topic, date.toDateString(), date.toTimeString(), topic, msg);
}

function mqttServer(logger){
    var that = this;
    var uri = 'mqtt://' + config.mqtt.username + ':' + config.mqtt.password + '@' + config.mqtt.host + ':' + config.mqtt.port;
    var safeUri = 'mqtt://'+ config.mqtt.host + ':' + config.mqtt.port;
    this.logger = logger;
    this.msgr = mqtt.connect(uri);
    
    this.msgr.on('connect', function () {
        logger.info('MQTT is rifting on: %s',safeUri);
    });
    
    this.msgr.on('error', function (error) {
        logger.error(error);
    });
    
    this.msgr.on('offline', function (error) {
        logger.error('mqtt offline');
    });

    this.msgr.on('message', function (topic, message) {
      // message is Buffer 
      logger.info('MQTT: Receive: ' + topic + ': '+  message.toString());
    });
    
}

mqttServer.prototype.publishRegister = function publishRegister(data){
    this.msgr.publish('disona.register', JSON.stringify(data));
    this.logger.info('MQTT: Publish: disona.register: '+  JSON.stringify(data));
};

mqttServer.prototype.publishFeedback = function publishFeedback(data){
    this.msgr.publish('disona.feedback',JSON.stringify(data));
    this.logger.info('MQTT: Publish: disona.feedback: '+  JSON.stringify(data));
};

mqttServer.prototype.publishStatus = function publishStatus(data){
    this.msgr.publish('disona.status',JSON.stringify(data));
    this.logger.info('MQTT: Publish: disona/status: '+  JSON.stringify(data));
};

mqttServer.prototype.publishAlert = function publishAlert(data){
    this.msgr.publish('disona.alert',JSON.stringify(data));
    this.logger.info('MQTT: Publish: disona/alert: '+  JSON.stringify(data));
};

mqttServer.prototype.publishOffline = function publishOffline(data){
    this.msgr.publish('disona.offline',JSON.stringify(data));
    this.logger.info('MQTT: Publish: disona/offline: '+  JSON.stringify(data));
};

module.exports = mqttServer;