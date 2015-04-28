'use strict';
var devices = require("./data.js").devices;
var data  = require("./data.js");

module.exports = {
    findByUuids: findByUuids,
    findAll: findAll
};

function findByUuids(Id, callback){
    devices.findOne({uuid: Id}, function(err,device){
        if(err) return callback({code: 400, message: err});
        if(!device) return callback({code: 400, message: 'device not found'});
        data.removeSensitiveDeviceData(device);
        callback(null,device);
    });
}

function findAll(callback){
    devices.find(function(err,devicesReturned){
        if(err) return callback({code: 400, message: err});
        devicesReturned.forEach(function(val){
           data.removeSensitiveDeviceData(val); 
        });
        callback(null,devicesReturned);
    });
}