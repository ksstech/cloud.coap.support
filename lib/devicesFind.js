'use strict';
var devices = require("./data.js").devices;

module.exports = {
    findByUuids: findByUuids,
    findAll: findAll
};

function findByUuids(Id, callback){
    devices.findOne({uuid: Id}, function(err,device){
        if(err) return callback({code: 400, message: err});
        //TODO: Remove sensitive data
        callback(null,device);
    });
}

function findAll(callback){
    devices.find(function(err,devices){
        if(err) return callback({code: 400, message: err});
        //TODO: remove sensitive data
        callback(null,devices);
    });
}