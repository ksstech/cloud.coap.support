'use strict';
var config = require('../config.js');
var u = require('./utils.js');
var mongojs = require('mongojs');

var uri = 'mongodb://' + config.mongodb.username + ':' + config.mongodb.password + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database;
var safeUri = 'mongodb://'+ config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database;
var db = mongojs(uri);

db.on('ready', function(){
    console.log("MongoDB is drumming on: %s",safeUri);
});

db.on('error', function(err){
    console.log('MongoDB is not happy: %s',err);
});

//events must be a capped collection, so check if it is, if not create as capped
db.getCollectionNames(function(err,names){
    if(err) console.log(err);
    else if(names.indexOf('events')){
        db.collection('events').isCapped(function(err,capped){
            if(err) console.log(err);
            else if(!capped){ 
                //drop collection and create new one
                db.collection('events').drop(function(err){
                    if(err) console.log(err);
                    else createCapped();
                });     
            }
       });
    } else {
        createCapped();
    }
});

module.exports = {
    devices: db.collection('devices'),
    orgs: db.collection('orgs'),
    events: db.collection('events'),
    data: db.collection('data'),
    authorize: authorize,
    removeSensitiveDeviceData: removeSensitiveDeviceData
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

function removeSensitiveDeviceData(device){
    delete device._id;
    delete device.timeStamp;
    delete device.online;
    delete device.token;
    return device;
}

function createCapped()
{
    db.createCollection('events',{capped: true, size: 5000, max: 200}, function(err,collection){
        if(err) console.log(err);
        else console.log('events capped');
    });
}
