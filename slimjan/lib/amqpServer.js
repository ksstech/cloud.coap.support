'use strict';
var config = require('../config.js');
var amqp = require('amqplib/callback_api');
var domain = require('domain');
var events = require('events');
var util = require('util');

var dom = domain.create();
dom.on('error', function(err){
  console.log(err);
});

function amqpServer(logger) {
  var that = this;
  this.logger = logger;
  this.log = 'imacs.slimjan.log';
  this.register = 'imacs.slimjan.register';
  this.receiveRegister = 'imacs.disona.register.queue';
  var uri = 'amqp://' + config.amqp.login + ':' + config.amqp.password + '@' + config.amqp.host + ':' + config.amqp.port + '/';
  var safeUri = 'amqp://'+ config.amqp.host + ':' + config.amqp.port;

  amqp.connect(uri, function(err,conn){
    dom.add(conn);
    if (err) that.logger.error('AMQP: ' + err);
    else {
      that.logger.info('AMQP is screaming on: %s',safeUri);
      conn.createChannel(function(err,channel){
        dom.add(channel);
        if(err) that.logger.error('AMQP: ' + err);
        else {
          that.amqpChannel = channel;
          that.logger.info('AMQP: channel created');
          channel.assertExchange(that.register,'fanout',{durable: true, autoDelete: false}, function(err, ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Exchange: ' + that.register);
          });
          channel.assertExchange(that.log,'topic',{durable: true, autoDelete: false}, function(err, ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Exchange: ' + that.log);
          });
          channel.assertQueue(that.receiveRegister, {durable: true, autoDelete: false, messageTtl: 1000}, function(err,ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Queue: ' + that.receiveRegister);
          });
          channel.consume(that.receiveRegister, function(msg){
            //console.log(msg);
            if (msg !== null) {
              var message = msg.content.toString();
              logger.info('AMQP REC ' + that.receiveRegister + ': '+  message);
              that.emit(that.receiveRegister, JSON.parse(message));
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
    //console.log(data);
    this.amqpChannel.publish(this.register, '', new Buffer(JSON.stringify(data)));
    this.logger.info('AMQP PUB ' + this.register);
};

amqpServer.prototype.publishLog = function publishLog(data){
    this.amqpChannel.publish(this.log, '', new Buffer(data));
};

module.exports = amqpServer;
