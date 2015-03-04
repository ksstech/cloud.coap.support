'use strict';
var devices = require("./data.js").devices;

//Updates specific device according to uuid
function unregisterDevice(deviceUuid,callback){
    devices.remove({uuid: deviceUuid}, function removeDeviceResult(err,data){
        if(err) return callback({code: 400, message: err});
        callback(null,{unregistered_uuid: deviceUuid});
    });
}

module.exports = {
    unregisterDevice: unregisterDevice
};