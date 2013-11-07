// -----------------------------------------------------------------
//  index.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

var debug = require('debug')('object.io');

module.exports.expose = function(socket, events, functs, ignore, object, dtor){
  
  Object.keys(object).forEach(function(key){
    if (!object.hasOwnProperty(key)) { return debug('skiping socket.%s', key); }
    if (typeof object[key] !== 'function') { return debug('ignore  socket.%s', key); }
    if (ignore && ignore.indexOf(key) !== -1) { return debug('ignore  socket.%s(...)', key); }
    if (key === 'disconnect') { return; }
    functs.push(key);
  });
  
  functs.forEach(function(method){
    socket.on(method, object[method].bind(object));
    debug('binding socket.%s(...) -> client.%s.(...)', method, method);
  });
  
  events.forEach(function(event){
    object.on(event, socket.emit.bind(socket, event));
    debug('binding client.on(\'%s\', ...) -> socket.emit(\'%s\', ...)', event, event);
  });
  
  socket.on('disconnect', function() {
    functs.forEach(function(method){
      socket.removeAllListeners(method);
    });
    dtor();
  });
};
