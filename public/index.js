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
  
  var send = [ 
    'write','pass','nick','user','send',
    'join','part','topic','kick','oper',
    'mode','invite','notice','who','whois',
    'whowas'
  ];
  var recv = Object.keys( window.Client.prototype).filter(function(key){ 
    return ['use'].indexOf(key) === -1;
  });
  
  send.forEach(function(event){
    client.on(event, socket.emit.bind(socket, event));
  });
  recv.forEach(function(event){
    socket.on(event, client[event].bind(client));
  });

  client.model.viewState(client.model.viewStates[1]);
  socket.on('disconnect', function() {
    client.model.viewState(client.model.viewStates[0]);
    send.forEach(function(event){
      client.removeAllListeners(event);
    });
    recv.forEach(function(event){
      socket.removeAllListeners(event);
    });
  });

});