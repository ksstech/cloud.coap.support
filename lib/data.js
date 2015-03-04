'use strict';
var config = require('../config.js');
var u = require('./utils.js');
var mongojs = require('mongojs');
var db = mongojs(config.mongodb);

module.exports = {
    devices: db.collection('devices'),
    orgs: db.collection('orgs'),
    events: db.collection('events'),
    data: db.collection('data'),
    authorize: authorize
};

function authorize(fromUuid, fromToken, callback){
    if(u.isAdmin(fromUuid, fromToken)) return callback(null,true);
    var devices = db.collection('devices');
    devices.findOne({uuid:fromUuid, token: fromToken}, function(err,device){
        if(err) return callback({code: 400, message: err});
        if(!device) return callback({code: 401, message: 'unauthorized'});
        else return callback(null,true);
    });
}
