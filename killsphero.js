var serialport = require("spheron/node_modules/serialport");
var SerialPort = serialport.SerialPort;
var util = require("util"), repl = require("repl");

var sphero = require('spheron/lib/sphero');
var toolbelt = require('spheron/lib/toolbelt');
var commands = require('spheron/lib/commands');
var macro = require('spheron/lib/macro-builder').macro;

var dev;

var connected = false;

serialport.list(function (err, ports) {
  dev = ports[ports.length -1].comName;

  sphero = sphero().open(dev, function(err){
    if (err) {
      console.log("ERRO CONEXAO", err);
      return;
    }
    console.log("CONECTADO");

    sphero.setRGB(0xff0000);

    sphero.setRawMotorValues(0, 0, 0, 0);
  });
});
