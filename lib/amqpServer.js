'use strict';
var config = require('../config.js');
var amqp = require('amqplib/callback_api');
var fluxator = require('../lib/fluxator.js');
var util = require('util');



function amqpServer(httpClient, logger) {
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
          //this is the main thread. stuff needs to happen from here
          //http is receiver and not guiding the processflow
          //create callback from fluxator to tell if all went well
          //if not then this needs to not ack the message but wait a while and try again
          //so that messages do not get lost.
          //rather sit in rabbit queue
          //create influxdb line builder
          //and seperate http request server for sending messages

          channel.consume(that.sense, function(msg){
            if (msg !== null) {
              var data;
              try {
                data = JSON.parse(msg.content.toString());
                //logger.info('1 Data Received');
              } catch (err) {
                logger.error('Error in Message string: ' + console.log(msg.content.toString()));
                channel.ack(msg);
                //return;
              }
              //logger.info('2 To Fluxator');
              var batch = fluxator(logger,data);
                //logger.info('3 Batch Received');
                  //logger.info('4 To sendBatch');
                if(batch != null) {
                  httpClient.sendBatch(batch, function(err,code){
                    //logger.info('5 Sendbatch received');
                    if(err) {
                      logger.error(err);
                      //wait 10 seconds
                      //requeue message
                      setTimeout(function(){
                        channel.nack(msg,false,true);
                      }, 10000);
                    }
                    else {
                      if (code != 204) logger.info(code + '\n' + data);
                      channel.ack(msg);
                    }
                  });
                } else {
                  //invalid message format so none generated move to next
                  channel.ack(msg);
                }

            }
          });
        }
      });
    }
  });
}

module.exports = amqpServer;
