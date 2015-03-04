'use strict';
var devices = require("./data.js").devices;

//Updates specific device according to uuid
function updateDevice(deviceUuid,data,callback){
    devices.update({uuid: deviceUuid}, {$set: data}, function updateDeviceResult(){
        devices.findOne({uuid: deviceUuid}, function findOneDeviceResult(err,findData){
            if(err) return callback({code: 400, message: err});
            delete findData.token;
            callback(null,findData);
        });
    });
}

module.exports = {
    updateDevice: updateDevice
};