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
function getRules(hw, type, callback){
	var fileName;
	var data;
	//build up file path and name, catch error if settings not correct
	try{ fileName = settings.rules_path + hw;}
	catch (ex) {callback(ex);}
	//get file extention. invalid types will result in error
	switch (type) {
		case 'sense': fileName += '.sns'; break;
		case 'rules': fileName += '.rls'; break;
		case 'probe': fileName += '.prb'; break;
		default: callback('invalid type');
	}
	//get the data from the file
	fs.readFile(fileName, {encoding: 'utf-8'}, function cbReadFile(err,rules){
				//console.log(rules);
				if(err) callback(err);
				else callback(null, rules);
    });
}

//exports
module.exports = {
	getRules: getRules
};
