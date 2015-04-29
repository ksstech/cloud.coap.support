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
};


function createCapped()
{
    db.createCollection('events',{capped: true, size: 5000, max: 200}, function(err,collection){
        if(err) console.log(err);
        else console.log('events capped');
    });
}
