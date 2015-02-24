'use strict';
var bcrypt = require('bcrypt');
///////////////////////////////////////////////
//Functionality used throughout the application
///////////////////////////////////////////////
function generateToken(){
    var crypto = require('crypto');
    return crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString()).digest('hex');
}
    
function getGeo(ipAddress){
    var geo = require('geoip-lite');
    var location = geo.lookup(ipAddress);
    if(!location) return {error: "no geo info found for ip: " + ipAddress};
    return location;
}
    
function hashToken(token, callback){
    bcrypt.hash(token, 8, function(err, hashedToken){
        if(err) { console.error(err); return callback(err); } 
        return callback(null,hashedToken);
    });
}


module.exports = {
    generateToken: generateToken,
    getGeo: getGeo,
    hashToken: hashToken
};