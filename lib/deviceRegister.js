'use strict';
var devices = require("./data.js").devices;
var uuid = require('node-uuid');
var utils = require('./utils.js');
var dns = require('dns');

module.exports = function(params,callback){
    //create device
    ///////////////////////////////////////////
    //check if d_uuid was supplied
    ///////////////////////////////////////////
    console.log('Check for d_uuid');
    if (!params.d_uuid) 
        return callback({code: 400, message: "no d_uuid"});
    //check if d_uuid exist
    ///////////////////////////////////////////
    console.log('Check for existing d_uuid');
    devices.findOne({d_uuid: params.d_uuid}, function(err,dev){
        if(err) {
            console.error(err); 
            return callback({code: 400, message: err});
        }
        if (dev) 
            return callback({code: 400, message: "d_uuid: " + dev.d_uuid + " exist"});
        
        console.log('Create Token');
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
                device.hostnames = hostnames;
                device.geo = utils.getGeo(params.ipAddress);
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
                    if (dev) return callback({code: 400, message: 'uuid ' + dev.uuid + ' exist'});
    //add the device
    //////////////////////////////////////////
                    devices.insert(device, function(err){
                        if(err) {
                            console.error(err); 
                            return callback({code: 400, message: err});
                        }
                        device.token = token;
                        return callback(false,device);
                    });
                });
            });
        });
    });
};