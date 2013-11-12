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
  
  socket.on('open', function(server, fn){
    var stream = net.connect(server);
    var client = irc(stream);
    
    var send = ['message','names','topic','join','part','welcome','data','nick','away'];
    var recv = ['pass','nick','user','send','join','part','names','topic'];
  
    client.use(require('./lib/plugins/away')());
    
    send.forEach(function(event){
      client.on(event, socket.emit.bind(socket, event));
    });
    recv.forEach(function(method){
      socket.on(method, client[method].bind(client));
    });
    
    socket.on('disconnect', function() {
      send.forEach(function(event){
        client.removeAllListeners(event);
      });
      recv.forEach(function(method){
        socket.removeAllListeners(method);
      });
      try {
        if (client) { client.quit(); }
      }
      finally{}
    });
    
    stream.on('end', function(){
      socket.disconnect();
    });
    
    if (fn) fn();
  });
  
});

debug('  - server listening on port', port);