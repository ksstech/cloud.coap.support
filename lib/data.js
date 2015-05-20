'use strict';
var config = require('../config.js');
var mongojs = require('mongojs');

//MongoDB will be used for two things
//2. mote information
//create something where the same connection is used throughout
//ToDo
//Create a new(class) object structure

function mongo(logger){
    var uri = 'mongodb://' + config.mongodb.username + ':' + config.mongodb.password + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database;
    var safeUri = 'mongodb://'+ config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database;
    this.db = mongojs(uri, ['activeMotes']);
    this.logger = logger;
    this.db.on('ready', function(){
        logger.info("MongoDB is drumming on: " + safeUri);
    });
    
    this.db.on('error', function(err){
        logger.error(err);
    });
    
    this.db.getLastError(function(){});
    
    //clear activeMotes
    this.db.activeMotes.remove(function(err){
        if(err) logger.error(err);
        else logger.info("MongoDB: aciveMotes cleared");
    });
    
}

mongo.prototype.registerMote = function (ip,port,mote,callback){
        var that = this;
        if (!mote.d_id) return callback({error: 'd_id required'});
        if (!mote.d_hw) return callback({error: 'd_hw required'});
        if (!mote.d_sw) return callback({error: 'd_sw required'});
        if (!mote.d_mfg) return callback({error: 'd_mfg required'});
        //if exist overwrite
        this.db.activeMotes.remove(mote, function activeMoteRemove(err){
            if(err) return callback(err);
            mote.ip = ip;
            mote.port = port;
            mote.timestamp = new Date().toISOString();
            that.db.activeMotes.insert(mote);
            return callback(null,mote);
        });
    };

module.exports = mongo;



