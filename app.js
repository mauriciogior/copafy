/**
 * Module dependencies.
 */
var express = require('express')
  , io = require('socket.io')
  , http = require('http')
  , twitter = require('ntwitter')
  , _ = require('underscore')
  , path = require('path');

//Create an express app
var app = express();

//Create the HTTP server with the express app as an argument
var server = http.createServer(app);

// IMPORTANT!!
//You will need to get your own key. Don't worry, it's free. But I cannot provide you one
//since it will instantiate a connection on my behalf and will drop all other streaming connections.
//Check out: https://dev.twitter.com/ You should be able to create an application and grab the following
//crednetials from the API Keys section of that application.
var api_key = 'JpYdDZBjn9DMLd1rvPvfLg';               // <---- Fill me in
var api_secret = 'YOjyPnJWqYJuirV1sNETw1tchjPZsODb1gt2k';            // <---- Fill me in
var access_token = '1405210758-lEWNOx4ZryR1EOwlg8YxlnkIoi1o4XwBCWV9yiO';          // <---- Fill me in
var access_token_secret = 'wCcMhqUuBR5z95nDR7IXchGdmbpFPH3Xi6AR6ryIiGtFZ';   // <---- Fill me in

// Twitter symbols array.
var watchSymbols = ['#chelsea', '#arsenal', '#football', '#worldcup', '#premiereleague', '#champions', '#league', '#uefa', '#fifa', '#manu', 'twitter', 'facebook', 'instagram'];


//sphero

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

    sphero.setRGB(0xffffff);

    connected = true;
  });
});


//Generic Express setup
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

//We're using bower components so add it to the path to make things easier
app.use('/components', express.static(path.join(__dirname, 'components')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Our only route! Render it with the current watchList
app.get('/', function(req, res) {
	res.render('index.html');
});

//Start a Socket.IO listen
var sockets = io.listen(server);

//Set the sockets.io configuration.
//THIS IS NECESSARY ONLY FOR HEROKU!
sockets.configure(function() {
  sockets.set('transports', ['xhr-polling']);
  sockets.set('polling duration', 10);
});

//If the client just connected, give them fresh data!
sockets.sockets.on('connection', function(socket) { 
    socket.emit('data', watchSymbols);
});

// Instantiate the twitter connection
var t = new twitter({
    consumer_key: api_key,
    consumer_secret: api_secret,
    access_token_key: access_token,
    access_token_secret: access_token_secret
});

// //Tell the twitter API to filter on the watchSymbols 
t.stream('statuses/filter', { track: watchSymbols }, function(stream) {

  //We have a connection. Now watch the 'data' event for incomming tweets.
  stream.on('data', function(tweet) {

    var claimed = false;
    //Make sure it was a valid tweet
    if (tweet.text !== undefined) {

      //We're gunna do some indexOf comparisons and we want it to be case agnostic.
      var text = tweet.text.toLowerCase();

      //Go through every symbol and see if it was mentioned. If so, increment its counter and
      //set the 'claimed' variable to true to indicate something was mentioned so we can increment
      //the 'total' counter!
      _.each(watchSymbols, function(v) {
          if (text.indexOf(v.toLowerCase()) !== -1) {
              tweet.hash = v;
              claimed = true;
          }
      });

      //If something was mentioned, increment the total counter and send the update to all the clients
      if (claimed) {

        if(connected)
        {
          //sphero.setBackLED(255);
          sphero.setRawMotorValues(1, 255, 0, 0);
          setTimeout(function(){
            sphero.setRawMotorValues(0, 0, 0, 0);
          }, 1000);
        }
  
        //Send to all the clients
        sockets.sockets.emit('data', tweet);

        console.log(tweet);
      }
    }
  });
});

//Create the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

server.on('close', function() {
  sphero.setRawMotorValues(0, 0, 0, 0);
});