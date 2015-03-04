{"changed":true,"filter":false,"title":"utils.js","tooltip":"/lib/utils.js","value":"'use strict';\nvar bcrypt = require('bcrypt');\nvar config = require('../config.js');\n///////////////////////////////////////////////\n//Functionality used throughout the application\n///////////////////////////////////////////////\nfunction generateToken(){\n    var crypto = require('crypto');\n    return crypto.createHash('sha1').update((new Date()).valueOf().toString() + Math.random().toString()).digest('hex');\n}\n    \nfunction getGeo(ipAddress){\n    var geo = require('geoip-lite');\n    var location = geo.lookup(ipAddress);\n    if(!location) return {error: \"no geo info found for ip: \" + ipAddress};\n    return location;\n}\n    \nfunction hashToken(token, callback){\n    bcrypt.hash(token, 8, function(err, hashedToken){\n        if(err) { console.error(err); return callback(err); } \n        return callback(null,hashedToken);\n    });\n}\n\nfunction logHttpRequest(req){\n    var date = new Date();\n    var msg = '[HTTP][Request][' + date.toDateString() + '][' + date.toTimeString() + ']';\n        msg += ' ' + req.route.method;\n        msg += ' ' + req.route.path;\n        msg += ' FROM: ' + getRemoteHttpIp(req);\n    console.log(msg);\n}\n\nfunction getRemoteHttpIp(req){\n    return  req.headers['x-forwarded-for'] || req.connection.remoteAddress;\n}\n\nfunction isAdmin(uuid, token){\n    if(uuid === config.administrator.uuid && token === config.administrator.token) return true;\n    else return false;\n}\n\nfunction linkFormatToJson(data){\n    var jsonReturn = {};\n    var firstSplit = data.split(',');\n    firstSplit.forEach(function(val){\n        var secondSplit = val.split(';');\n        secondSplit[0] = secondSplit[0].replace('<','');\n        secondSplit[0] = secondSplit[0].replace('>','');\n        secondSplit[1] = secondSplit[1] === '40' ? 'application/link-format' : secondSplit[1];\n        secondSplit[1] = secondSplit[1] === '50' ? 'application/json' : secondSplit[1];\n        jsonReturn[secondSplit[0]] = secondSplit[1];\n    });\n    return jsonReturn;\n}\n\nfunction handleError(err,res){\n    console.log(err);\n    res.json(err.code,err);\n}\n\nmodule.exports = {\n    generateToken: generateToken,\n    getGeo: getGeo,\n    hashToken: hashToken,\n    logHttpRequest: logHttpRequest,\n    getRemoteHttpIp: getRemoteHttpIp,\n    isAdmin: isAdmin,\n    linkFormatToJson: linkFormatToJson,\n    handleError: handleError\n};","undoManager":{"mark":-1,"position":63,"stack":[[{"group":"doc","deltas":[{"start":{"row":55,"column":1},"end":{"row":56,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":56,"column":0},"end":{"row":57,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":0},"end":{"row":57,"column":1},"action":"insert","lines":["f"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":1},"end":{"row":57,"column":2},"action":"insert","lines":["u"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":2},"end":{"row":57,"column":3},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":3},"end":{"row":57,"column":4},"action":"insert","lines":["c"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":4},"end":{"row":57,"column":5},"action":"insert","lines":["t"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":5},"end":{"row":57,"column":6},"action":"insert","lines":["i"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":6},"end":{"row":57,"column":7},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":7},"end":{"row":57,"column":8},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":8},"end":{"row":57,"column":9},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":9},"end":{"row":57,"column":10},"action":"insert","lines":["h"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":10},"end":{"row":57,"column":11},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":11},"end":{"row":57,"column":12},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":12},"end":{"row":57,"column":13},"action":"insert","lines":["d"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":13},"end":{"row":57,"column":14},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":14},"end":{"row":57,"column":15},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":15},"end":{"row":57,"column":16},"action":"insert","lines":["E"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":16},"end":{"row":57,"column":17},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":17},"end":{"row":57,"column":18},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":18},"end":{"row":57,"column":19},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":19},"end":{"row":57,"column":20},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":20},"end":{"row":57,"column":22},"action":"insert","lines":["()"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":21},"end":{"row":57,"column":22},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":22},"end":{"row":57,"column":23},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":23},"end":{"row":57,"column":24},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":24},"end":{"row":57,"column":25},"action":"insert","lines":[","]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":25},"end":{"row":57,"column":26},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":26},"end":{"row":57,"column":27},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":27},"end":{"row":57,"column":28},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":29},"end":{"row":57,"column":30},"action":"insert","lines":["{"]}]}],[{"group":"doc","deltas":[{"start":{"row":57,"column":30},"end":{"row":59,"column":1},"action":"insert","lines":["","    ","}"]}]}],[{"group":"doc","deltas":[{"start":{"row":58,"column":4},"end":{"row":59,"column":39},"action":"insert","lines":["console.log(err);","                res.json(err.code,err);"]}]}],[{"group":"doc","deltas":[{"start":{"row":59,"column":0},"end":{"row":59,"column":4},"action":"remove","lines":["    "]}]}],[{"group":"doc","deltas":[{"start":{"row":59,"column":0},"end":{"row":59,"column":4},"action":"remove","lines":["    "]}]}],[{"group":"doc","deltas":[{"start":{"row":59,"column":0},"end":{"row":59,"column":4},"action":"remove","lines":["    "]}]}],[{"group":"doc","deltas":[{"start":{"row":69,"column":38},"end":{"row":70,"column":0},"action":"insert","lines":["",""]},{"start":{"row":70,"column":0},"end":{"row":70,"column":4},"action":"insert","lines":["    "]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":4},"end":{"row":70,"column":5},"action":"insert","lines":["h"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":5},"end":{"row":70,"column":6},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":6},"end":{"row":70,"column":7},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":7},"end":{"row":70,"column":8},"action":"insert","lines":["d"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":8},"end":{"row":70,"column":9},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":8},"end":{"row":70,"column":9},"action":"remove","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":8},"end":{"row":70,"column":9},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":9},"end":{"row":70,"column":10},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":10},"end":{"row":70,"column":11},"action":"insert","lines":["E"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":11},"end":{"row":70,"column":12},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":12},"end":{"row":70,"column":13},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":13},"end":{"row":70,"column":14},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":14},"end":{"row":70,"column":15},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":15},"end":{"row":70,"column":16},"action":"insert","lines":[":"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":16},"end":{"row":70,"column":17},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":17},"end":{"row":70,"column":18},"action":"insert","lines":["h"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":18},"end":{"row":70,"column":19},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":19},"end":{"row":70,"column":20},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":20},"end":{"row":70,"column":21},"action":"insert","lines":["d"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":21},"end":{"row":70,"column":22},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":22},"end":{"row":70,"column":23},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":23},"end":{"row":70,"column":24},"action":"insert","lines":["E"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":24},"end":{"row":70,"column":25},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":25},"end":{"row":70,"column":26},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":26},"end":{"row":70,"column":27},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":70,"column":27},"end":{"row":70,"column":28},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":69,"column":38},"end":{"row":69,"column":39},"action":"insert","lines":[","]}]}]]},"ace":{"folds":[],"scrolltop":660,"scrollleft":0,"selection":{"start":{"row":66,"column":35},"end":{"row":66,"column":35},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":156,"mode":"ace/mode/javascript"}},"timestamp":1425407153000}