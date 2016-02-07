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
  this.sense = 'imacs.disona.sense.queue';
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
          channel.assertQueue(that.sense, {durable: true, autoDelete: false}, function(err,ok){
            if (err) that.logger.error('AMQP: ' + err);
            else that.logger.info('AMQP: connected to Queue: ' + that.sense);
          });
          channel.consume(that.sense, function(msg){
            if (msg !== null) {
              var data;
              try {

                data = JSON.parse(msg.content.toString());
                //logger.info('AMQP REC ' + that.sense + ': '+  'd_id: ' + data.d_id);
                //console.log(msg.content.toString());
                that.emit(that.sense, data);
                channel.ack(msg);
              } catch (err) {
                logger.error('Error in Message string: ' + console.log(msg.content.toString()));
                channel.ack(msg);
              }
            }
          });
        }
      });
    }
  });
}

util.inherits(amqpServer, events.EventEmitter)

module.exports = amqpServer;
