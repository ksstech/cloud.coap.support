'use strict';
var config = require('../config.js');
var amqp = require('amqplib/callback_api');
//var domain = require('domain');
var events = require('events');
var util = require('util');



function amqpServer(logger) {
  // var dom = domain.create();
  // dom.on('error', function(err){
  //   console.log(err);
  // });
  var that = this;
  this.logger = logger;
  this.alert = 'imacs.disona.alert';
  this.log = 'imacs.disona.log';
  this.register = 'imacs.disona.register';
  this.sense = 'imacs.disona.sense';
  this.returnRegister = 'imacs.slimjan.register.queue';
  var uri = 'amqp://' + config.amqp.login + ':' + config.amqp.password + '@' + config.amqp.host + ':' + config.amqp.port + '/';
  var safeUri = 'amqp://'+ config.amqp.host + ':' + config.amqp.port;

  amqp.connect(uri, function(err,conn){
    //dom.add(conn);
    if (err) that.logger.error('AMQP: ' + err);
    else {
      that.logger.info('AMQP is screaming on: %s',safeUri);
      conn.createChannel(function(err,channel){
        //dom.add(channel);
        if(err) that.logger.error('AMQP: ' + err);
        else {
          that.amqpChannel = channel;
          that.logger.info('AMQP: channel created');
          channel.assertExchange(that.register,'fanout',{durable: true, autoDelete: false}, function(err, ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Exchange: imacs.disona.register');
          });
          channel.assertExchange(that.sense,'fanout',{durable: true, autoDelete: false}, function(err, ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Exchange: imacs.disona.sense');
          });
          channel.assertExchange(that.alert,'fanout',{durable: true, autoDelete: false}, function(err, ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Exchange: imacs.disona.alert');
          });
          channel.assertExchange(that.log,'topic',{durable: true, autoDelete: false}, function(err, ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Exchange: imacs.disona.log');
          });
          channel.assertQueue(that.returnRegister, {durable: true, autoDelete: false}, function(err,ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Queue: ' + that.returnRegister);
          });
          channel.consume(that.returnRegister, function(msg){
            if (msg !== null) {
              console.log('MSG:'+ msg.content.toString());
              logger.info('AMQP REC ' + that.returnRegister + ': '+  msg.content.toString());
              that.emit(that.returnRegister, JSON.parse(msg.content.toString()));
              channel.ack(msg);
            }
          });
        }
      });
    }
  });
}

util.inherits(amqpServer, events.EventEmitter)

amqpServer.prototype.publishRegister = function publishRegister(data){
    var buf = new Buffer(data);
    this.amqpChannel.publish(this.register, '', buf);
    this.logger.info('AMQP PUB ' + this.register);
};

amqpServer.prototype.publishAlert = function publishAlert(data){
    this.amqpChannel.publish(this.alert, '', new Buffer(data));
    this.logger.info('AMQP PUB ' + this.alert);
};

amqpServer.prototype.publishSense = function publishSense(data){
    this.amqpChannel.publish(this.sense, '', new Buffer(data));
    this.logger.info('AMQP PUB ' + this.sense);
};

amqpServer.prototype.publishLog = function publishLog(data){
    this.amqpChannel.publish(this.log, new Buffer(data));
};

module.exports = amqpServer;
