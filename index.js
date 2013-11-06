// -----------------------------------------------------------------
//  index.js
//  
//  irc.milhen.ch
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

// -----------------------------------------------------------------
//  Dependencies

var debuger = require('debug'),
    logger = debuger('http'),
    loggerb = debuger('socket'),
    connect = require('connect'),
    sockets = require('socket.io'),
    http    = require('http'),
    irc     = require('slate-irc'),
    net     = require('net');

// -----------------------------------------------------------------
//  Main

var port = process.env.PORT || 3000;

var app  = connect().use(connect.static('public'));
  
var server = http.createServer(app).listen(port);

var io = sockets.listen(server);

io.set('log level', 2);

io.of('/irc').on('connection', function (socket) {
  
  var events = ['message','names','topic','away','quit','join','part','kick','nick'];
  var commands = ['ERROR','NOTICE','PING','MODE'];
  var client;
  
  socket.on('open', function(config, fn){
    client = irc(net.connect(config.host));
    client.nick(config.nick);
    if (config.user.name) {
      client.user(config.user.name, config.user.real);
      client.pass(config.user.pass);
    } else {
      client.user(config.nick, config.nick);
    }
    events.forEach(function(event){
      client.on(event, socket.emit.bind(socket, event));
    });
    commands.forEach(function(command){
      client.on('data', function(msg){ 
        if (msg.command !== command) return; 
        socket.emit('data', msg); 
      });
    });
    client.on('data', function(msg){ 
      loggerb(msg.command, msg.string);
    });
    if (config.chan) {
      config.chan.forEach(function(room){
        client.join(room);
      });
    }
    if (fn) fn();
  });
  socket.on('send', function(data, fn){
    client.send(data.to, data.message);
    if (fn) fn();
  });
  socket.on('disconnect', function() {
    socket.removeAllListeners('open');
    socket.removeAllListeners('send');
    if (client) {
      client.quit();
    }
  }); 
});

logger('  - server listening on port', port);