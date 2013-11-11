// -----------------------------------------------------------------
//  parser.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint browser:true */
/* jshint -W103, -W120 */

(function(factory){
  window.Parser = factory(window.EventEmitter);
}(function(EventEmitter){
  
  function Parser() { }
  
  Parser.prototype.__proto__ = EventEmitter.prototype;
  
  Parser.prototype.line = function(event){
    var i, 
      command = '', 
      params = '', 
      line = event.string.replace(/^\s+|\s+$/g, '');

    if (line[0] === '/') {
      i = line.indexOf(' ');
      if (i === -1) i = line.length;
      command = line.slice(1, i);
      params = line.slice(i+1).split(' ');
    }
    
    event.command = command;
    event.params = params || '';
    
    this.emit('message', event);
  };
  
  return Parser;
}));
