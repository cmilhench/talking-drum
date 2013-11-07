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

var debug   = require('debug')('http'),
    connect = require('connect'),
    sockets = require('socket.io'),
    objects = require('./lib/object.io'),
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
  
  var events = ['message','names','topic','away','quit','join','part','kick','nick','data'];
  var ignore = ['use','onmessage','write','quit'];
  var functs = ['pass','nick','user','send','join','part'];
  var client;
  
  socket.on('open', function(config, fn){
    client = irc(net.connect(config.host));
    objects.expose(socket, events, functs, ignore, client, function(){
      if (client) {
        client.quit();
      }
    });
    if (fn) fn();
  });
  
});

debug('  - server listening on port', port);