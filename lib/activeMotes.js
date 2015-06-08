/**
 * Class structure for keeping in memory a list of motes connected
 */
'use strict'

//////////////////////////////
///constructor
function activeMotes(){
	this.moteCollection = {};
}

///////////////////////////////////////
//Add new mote
//data: json must have d_uid, d_hw, d_sw, d_mf
//callback error, mote
activeMotes.protoype.add = function addMote(data, callback){
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
}

activeMotes.prototype.remove = function removeMote(d_id, callback){
	
}

module.exports = ativeMotes;