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
    
    irc.prototype.write = function(str, fn){
      debug('sending %s %s', str);
      this.stream.write(str + '\r\n', fn);
    };
    irc.prototype.oper = function(name, password, fn){
      this.write('OPER ' + name + ' ' + password, fn);
    };
    irc.prototype.mode = function(target, flags, params, fn){
      if ('function' === typeof params) {
        fn = params;
        params = '';
      }
      this.write('MODE ' + target + ' ' + flags + ' ' + params, fn);
    };
    irc.prototype.invite = function(name, channel, fn){
      this.write('INVITE ' + name + ' ' + channel, fn);
    };
    irc.prototype.notice = function(target, msg, fn){
      debug('*notice %s %s', target, msg);
      this.write('NOTICE ' + target + ' :' + msg, fn);
    };
    //whois, whowas with callback
    //list,motd,version,stats,links,time with callback

    var send = [
      'welcome', 'nick', 'join', 'part', 'topic', 
      'names', 'message', 'away', 'data'
    ];
    var recv = Object.keys(irc.prototype).filter(function(key){ 
      return ['quit','use','onmessage'].indexOf(key) === -1;
    });
    
    client.use(require('./lib/plugins/away')());
    
    send.forEach(function(method){
      debug('binding client.on(\'%s\', socket.emit(\'.%s\', ...));', method, method);
      client.on(method, socket.emit.bind(socket, method));
    });
    recv.forEach(function(method){
      debug('binding socket.on(\'%s\', irc.%s(...));', method, method);
      //socket.on(method, client[method].bind(client));
      socket.on(method, function(){
        debug('calling irc.%s(%s));', method, arguments);
        client[method].apply(client, arguments);
      });
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