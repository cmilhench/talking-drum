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
    valueAccessor().subscribe(function(){
      element.scrollTop = element.scrollHeight;
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
window.client = client;

// -----------------------------------------------------------------
//  listen to socket events
var irc = window.io.connect('http://localhost:3000/irc');
var socket = irc.on('connect', function () {
  
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
    'write','pass','nick','user','send',
    'join','part','topic','kick','oper',
    'mode','invite','notice','quit','whois',
    'who','whowas',
    'open'
  ];
  
  var recv = [
    'welcome','nick','join','part','topic', 
    'names','message','notice','away','data', 
    'quit', 'err',
    'close'
  ];

  subscribe(recv, send);
  
  client.model.viewState('closed');
  
  // Server disconnect
  socket.on('disconnect', function() {
    unsubscribe(recv, send);
    socket.removeAllListeners('disconnect');
    client.model.viewState('disconnected');
    client.model.channel(undefined);
    client.model.channels([]);
  });

});