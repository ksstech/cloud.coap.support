'use strict';
var config = require('../config.js');
var mongojs = require('mongojs');
var db = mongojs(config.mongodb);

module.exports = {
    devices: db.collection('devices'),
    orgs: db.collection('orgs'),
    events: db.collection('events'),
    data: db.collection('data')

};
