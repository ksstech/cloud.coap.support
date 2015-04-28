'use strict';
var devices = require("./data.js").devices;
var dataManager = require("./data.js");

//Updates specific device according to uuid
function updateDevice(deviceUuid,data,callback){
    devices.update({uuid: deviceUuid}, {$set: data}, function(){
        devices.findOne({uuid: deviceUuid}, function(err,findData){
            if(err) return callback({code: 400, message: err});
            if(!findData) return callback({code: 400, message: 'device not found'});
            findData = dataManager.removeSensitiveDeviceData(findData);
            callback(null,findData);
        });
    });
}

module.exports = {
    updateDevice: updateDevice
};