/**
 * Class structure for keeping in memory a list of motes connected
*/
'use strict';

//////////////////////////////
///constructor
function activeMotes() {
	this.moteCollection = {};
};

///////////////////////////////////////
//Add new mote
//data: json must have d_uid, d_hw, d_sw, d_mf
//callback error, mote
activeMotes.protoype.addMote = function (data, callback){
	var that = this;
	//validate
	if (!data.hostname) return callback({error: 'hostname required'});
	if (!data.port) return callback({error: 'port required'});
	if (!data.d_id) return callback({error: 'd_id required'});
    if (!data.d_hw) return callback({error: 'd_hw required'});
    if (!data.d_sw) return callback({error: 'd_sw required'});
    if (!data.d_mf) return callback({error: 'd_mf required'});
    //check if exist
    if(this.moteCollection[data.d_id]) return callback({error: 'mote exists', mote: this.moteCollection[data.d_id]});
    
    //add timestamp
    data.timestamp = new Date().toISOString();
    //add mote
    this.moteCollection.set(data.d_id,data);
    return callback(null,data);
};

////////////////////////////////////////////////////
//Remove mote from collection
//data: d_uid of the mote
//callback: err
activeMotes.prototype.remove = function removeMote(d_id, callback){
	var that = this;
	if(this.moteCollection[d_id]) {
		delete that.moteCollection[d_id];
		callback(null);
	} else {
		callback({error: 'No d_id ' + d_id + 'in collection'});
	}
		
};

///////////////////////////////////////////////////
//Get mote from collection
//data: d_id
//callback: err, mote
activeMotes.protoType.getOne = function getMote(d_id, callback){
	var that = this;
	if(this.moteCollection[d_id]) {
		callback(null,that.moteCollection[d_id]);
	} else {
		callback({error: 'No d_id ' + d_id + 'in collection'});
	}
};

//////////////////////////////////////////////////
//options {d_id:} or {hostname:, port:}
//callback error, true/false
activeMotes.prototype.exist = function moteExist(options, callback) {
	var that = this;
	if(options.d_id) {
		if(that.moteCollection[options.d_id]) {
			callback (null,true);
		} else {
			callback (null, false);
		}
	} else if(options.hostname && options.port) {
		for (var key in that.moteCollection) {
			if(that.moteCollection.hasOwnProperty(key)) {
				var mote = that.moteCollection[key];
				if (mote.hostname === options.hostname && mote.ip === options.ip) {
					callback (null, true);
				}
			}
		}
		callback (null, false);
	} else {
		callback ({error: 'incorrect options'});
	}
};

module.exports = activeMotes;