'use strict';
var devices = require("./data.js").devices;
var data = require("./data.js")
var uuid = require('node-uuid');
var utils = require('./utils.js');
var dns = require('dns');

module.exports = function(config,params,callback){
    //create device
    ///////////////////////////////////////////
    //check if d_uuid was supplied
    ///////////////////////////////////////////
    if (!params.d_uuid) 
        return callback({code: 400, message: "no d_uuid"});
    //check if d_uuid exist
    ///////////////////////////////////////////
    devices.findOne({d_uuid: params.d_uuid}, function(err,dev){
        if(err) {
            console.error(err); 
            return callback({code: 400, message: err});
        }
        if (dev && !config.allow_reregister) 
            return callback({code: 400, message: "d_uuid: " + dev.d_uuid + " exist"});
        
        var token = params.token || utils.generateToken();
        var hashedToken;
    //hash the token
    ///////////////////////////////////////////
        utils.hashToken(token, function(err,hashed){
            if(err) {
                console.error(err); 
                return callback({code: 404, message: "cannot hash token: " + err});
            }
            hashedToken = hashed;
    //set required data
    /////////////////////////////////////////
            var device = params;
            device.uuid = params.uuid || uuid.v1();
            device.token = hashedToken;
    //try for hostnames
    /////////////////////////////////////////
            dns.reverse(device.ipAddress, function(err,hostnames){
                if(err) {
                    console.error(err); 
                    return callback({code: 400, message: err});
                }
                device.timeStamp = new Date();
                device.online = false;
            
    //look for existing uuid
    //////////////////////////////////////////
                devices.findOne({uuid: device.uuid}, function(err,dev){
                    if(err) 
                        if(!err.code === "ENOTFOUND") {
                            console.error(err); 
                            return callback({code: 400, message: err});
                        }
                    if (dev && !config.allow_reregister) return callback({code: 400, message: 'uuid ' + dev.uuid + ' exist'});
    //add the device
    //////////////////////////////////////////
                    devices.remove({d_uuid: device.d_uuid});
                    devices.insert(device, function(err){
                        if(err) {
                            console.error(err); 
                            return callback({code: 400, message: err});
                        }
                        var returnData = {
                            d_uuid: device.d_uuid,
                            uuid: device.uuid,
                            token: token
                        };
                        return callback(false,returnData);
                    });
                });
            });
        });
    });
};