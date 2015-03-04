'use strict';
var bcrypt = require('bcrypt');
var config = require('../config.js');
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

function logHttpRequest(req){
    var date = new Date();
    var msg = '[HTTP][Request][' + date.toDateString() + '][' + date.toTimeString() + ']';
        msg += ' ' + req.route.method;
        msg += ' ' + req.route.path;
        msg += ' FROM: ' + getRemoteHttpIp(req);
    console.log(msg);
}

function getRemoteHttpIp(req){
    return  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

function isAdmin(uuid, token){
    if(uuid === config.administrator.uuid && token === config.administrator.token) return true;
    else return false;
}

function linkFormatToJson(data){
    var jsonReturn = {};
    var firstSplit = data.split(',');
    firstSplit.forEach(function(val){
        var secondSplit = val.split(';');
        secondSplit[0] = secondSplit[0].replace('<','');
        secondSplit[0] = secondSplit[0].replace('>','');
        secondSplit[1] = secondSplit[1] === '40' ? 'application/link-format' : secondSplit[1];
        secondSplit[1] = secondSplit[1] === '50' ? 'application/json' : secondSplit[1];
        jsonReturn[secondSplit[0]] = secondSplit[1];
    });
    return jsonReturn;
}

function handleError(err,res){
    console.log(err);
    res.json(err.code,err);
}

module.exports = {
    generateToken: generateToken,
    getGeo: getGeo,
    hashToken: hashToken,
    logHttpRequest: logHttpRequest,
    getRemoteHttpIp: getRemoteHttpIp,
    isAdmin: isAdmin,
    linkFormatToJson: linkFormatToJson,
    handleError: handleError
};