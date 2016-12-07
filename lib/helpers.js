/**
 * MWP 20150713
 * various helper functions
 */
var fs 			= require('fs');
var settings 	= require('../settings');

//returns a rule set according to hardware and rule type
//@hw:		hardware type e.g. LP or LP_BP
//@type:	sense, rule or probe
//@callback:err, rules
function getRules(d_id, hw, type, callback){
	var fileNameId;
	var fileNameHw;
	var data;
	//build up file path and name, catch error if settings not correct
	try{ fileNameId = settings.rules_path + d_id;}
	catch (ex) {callback(ex);}
	try{ fileNameHw = settings.rules_path + hw;}
	catch (ex) {callback(ex);}
	//get file extention. invalid types will result in error
	switch (type) {
		case 'sense':
			fileNameHw += '.sns';
			fileNameId += '.sns';
			break;
		case 'rules':
			fileNameHw += '.rls';
			fileNameId += '.rls';
			break;
		case 'probe':
			fileNameHw += '.prb';
			fileNameId += '.prb';
			break;
		default: callback('invalid type');
	}
	//get the data from the file
	//console.log('FilenameId: ' + fileNameId);
	//console.log('FilenameHw: ' + fileNameHw);
	try {
		var xst = fs.statSync(fileNameId);
		console.log('Stats: ' + xst);
		fs.readFile(fileNameId, {encoding: 'utf-8'}, function cbReadFile(err,rules){
				console.log('ID: ' + rules);
				if(err) callback(err);
				else callback(null, rules);
    });
	}
	catch (ex) {
		try {
			var xst = fs.statSync(fileNameHw);
			fs.readFile(fileNameHw, {encoding: 'utf-8'}, function cbReadFile(err,rules){
						console.log('Hw: ' + rules);
						if(err) callback(err);
						else callback(null, rules);
		  });
		} catch (exx) {
			callback(null, '');
		}
	}
}

//exports
module.exports = {
	getRules: getRules
};
