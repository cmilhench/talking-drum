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

var debug   = require('debug')('app'),
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
    
    //whois, whowas with callback
    //list,motd,version,stats,links,time with callback
    
    var subscribe = function(i, o){
      i.forEach(function(method){
        socket.on(method, client[method].bind(client));
      });
      o.forEach(function(method){
        client.on(method, socket.emit.bind(socket, method));
      });
    };
    
    var unsubscribe = function(i, o) {
      i.forEach(function(method){
        socket.removeAllListeners(method);
      });
      o.forEach(function(method){
        client.removeAllListeners(method);
      });
    };
    
    var send = [
      'welcome','nick','join','part','topic', 
      'names','message','notice','away','data', 
      'quit'
    ];

    var recv = [
      'write','pass','nick','user','send',
      'join','part','topic','kick','oper',
      'mode','invite','notice','quit', 'whois', 
      /*'who', 'whowas'*/ 
    ];

    subscribe(recv, send);
    
    // Client disconnect
    socket.on('disconnect', function() {
      unsubscribe(recv, send);
      socket.removeAllListeners('disconnect');
      if (client && stream.writable) { 
        client.quit('Client disconnected'); 
      }
    });
    
    // Server disconnect
    stream.on('end', function(){
      unsubscribe(recv, send);
      socket.removeAllListeners('disconnect');
      socket.emit('close');
      stream.destroy();
    });
    
    if (fn) fn();
  });
  
});

debug('  - server listening on port', port);