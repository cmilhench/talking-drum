// -----------------------------------------------------------------
//  emitter.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint browser:true, jquery:true */

(function(factory) {
  window.Emitter = factory();
}(function() {


  function EventEmitter() {}

  EventEmitter.prototype.addListener = function(type, listener) {
    // TODO: register `type` event
    if (!this._events) {
      this._events = {};
    }
    if (!this._events[type]) {
      this._events[type] = [];
    }
    this._events[type].push(listener);
    return this;
  };

  EventEmitter.prototype.removeListener = function(type, listener) {
    var i, position = -1;
    if (!this._events || !this._events[type]) {
      return this;
    }
    for (i = this._events[type].length; i-- > 0;) {
      if (this._events[type][i] === listener) {
        position = i;
        break;
      }
    }
    if (position < 0) {
      return this;
    }
    if (this._events[type].length === 1) {
      this._events[type].length = 0;
      delete this._events[type];
    } else {
      this._events[type].splice(position, 1);
    }
    return this;
  }; 

  EventEmitter.prototype.removeAllListeners = function(type) {
    var key, listeners;
    if (!this._events) {
      return this;
    }
    if (arguments.length === 0) {
      for (key in this._events) {
        this.removeAllListeners(key);
      }
      this._events = {};
      return this;
    }
    listeners = this._events[type];
    while (listeners && listeners.length) {
      this.removeListener(type, listeners[listeners.length - 1]);
    }
  }; 

  EventEmitter.prototype.emit = function(type) {
    var i, handler, listeners, args;
    if (!this._events) {
      this._events = {};
    }
    handler = this._events[type];
    if (Array.isArray(handler)) {
      args = Array.prototype.splice.call(arguments, 1);
      listeners = handler.slice();
      for (i = 0; i < listeners.length; i++) {
        listeners[i].apply(this, args);
      }
    }
  }; 

  EventEmitter.prototype.on = EventEmitter.prototype.addListener; 
  EventEmitter.prototype.off = EventEmitter.prototype.addListener;

  return EventEmitter;
}));
