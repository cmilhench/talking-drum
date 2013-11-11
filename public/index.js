// -----------------------------------------------------------------
//  index.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint browser:true */

window.ko.bindingHandlers.scrollBottom = {
  init: function(element, valueAccessor) {
    var previous = element.scrollTop;
    valueAccessor().subscribe(function(){
      if (element.scrollTop === previous) {
        element.scrollTop = element.scrollHeight;
        previous = element.scrollTop;
      }
    });
  }
};

window.ko.bindingHandlers.contract = {
  init: function(element, valueAccessor) {
    var resize = function(){
      // expected to run befor the expand so null the expanded one out here.
      element.parentNode.querySelector('[data-bind*="expand:"]').style['min-height'] = '80px';
      element.style['max-height'] = '100%';
      var style = window.getComputedStyle(element.parentNode);
      var bottom = parseInt(style['margin-top'], 10);
      var top = parseInt(style['margin-bottom'], 10);
      var space = window.innerHeight - (bottom + element.parentNode.offsetHeight + top);
      if (space < 0) {
        element.style['max-height'] = (element.offsetHeight + space) + 'px';
      }
    };
    valueAccessor().subscribe(resize);
    window.addEventListener('resize', resize);
    resize();
  }
};

window.ko.bindingHandlers.expand = {
  init: function(element, valueAccessor) {
    var resize = function(){
      element.style['min-height'] = '80px';
      var style = window.getComputedStyle(element.parentNode);
      var bottom = parseInt(style['margin-top'], 10);
      var top = parseInt(style['margin-bottom'], 10);
      var space = window.innerHeight - (bottom + element.parentNode.offsetHeight + top);
      if (space > 0) {
        element.style['min-height'] = (element.offsetHeight + space) + 'px';
      }
    };
    valueAccessor().subscribe(resize);
    window.addEventListener('resize', resize);
    resize();
  }
};

// -----------------------------------------------------------------
//  Initialization

var vm = new window.ViewModel();
var client = new window.Client(vm);
window.ko.applyBindings(vm);

// -----------------------------------------------------------------
//  listen to socket events
var irc = window.io.connect('http://localhost:3000/irc');
var socket = irc.on('connect', function () {
  
  var send = ['pass','nick','user','send','join','part','names','topic'];
  var recv = ['message','names','topic','join','part','welcome','data','nick','away'];
  
  send.forEach(function(event){
    client.on(event, socket.emit.bind(socket, event));
  });
  recv.forEach(function(event){
    socket.on(event, client[event].bind(client));
  });
  
  socket.on('disconnect', function() {
    send.forEach(function(event){
      client.removeAllListeners(event);
    });
    recv.forEach(function(event){
      socket.removeAllListeners(event);
    });
  });
  
  var config = {
    host: { port: 6667, host: 'irc.freenode.org' },
    nick: 'tddubug',
    chan: ['#talking-drum'],
    user: {  }
  };
  
  // Connect
  socket.emit('open', config, function(){
    socket.emit('nick', config.nick, function(){
      socket.emit('user', config.nick, config.nick, function(){
        config.chan.forEach(function(channel){
          socket.emit('join', channel, function(){
            // sent everything and asked to join a channel
          });
        });
      });
    });  
  });

});