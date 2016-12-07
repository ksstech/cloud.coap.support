'use strict';
//do this tp make the help writing easier and on multiple lines
var helpTop = 'Welcome to DiSoNa';
    helpTop += '\n\nFor specific topics use [URL]/[command]/help';
    helpTop += '\n\nCommands:';
    helpTop += '\n/status : Check if DiSoNa service is on-line.';
    helpTop += '\n/ipaddress : Return your public IP address.';
    helpTop += '\n/devices : GET, POST, PUT and DELETE operations on devices.';

var helpStatus = 'Welcome to DiSoNa';
    helpStatus += '\n\n/status: GET: Return the status of the DiSoNa service.'

var helpIpAddress = 'Welcome to DiSoNa';
    helpIpAddress += '\n\n/ipaddress: GET: Return your public IP address.'
    
module.exports = {
    top: helpTop,
    status: helpStatus,
    ipaddress: helpIpAddress
}