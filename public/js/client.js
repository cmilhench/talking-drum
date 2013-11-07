// -----------------------------------------------------------------
//  client.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint browser:true, jquery:true */
/* jshint -W103 */

(function(factory){
  window.Client = factory(window.Emitter, window.Parser);
}(function(Emitter, Parser){
  
  var plugins = {
    privmsg: function(client){
      client.on('data', function(msg){
        if ('msg' !== msg.command) return;
        var e = {}, params = msg.params.split(' ');
        e.from = client.storage.nick;
        e.to = params.shift();
        e.message = params.join(' ');
        client.emit('send', e.to, e.message);
        client.message(e);
      });
    },
    message: function(client){
      client.on('data', function(msg){
        if ('' !== msg.command) return;
        var e = {};
        e.from = client.storage.nick;
        e.to = client.storage.channel;
        e.message = msg.string;
        client.emit('send', e.to, e.message);
        client.message(e);
      });
    }
  };

  function Client() {
    var self = this;
    this.storage = { nick:'', channel:'#zarniwoop', messages: {}, names: {} };
    this.parser = new Parser();
    this.parser.on('message', self.emit.bind(self, 'data'));
    this.use(plugins.privmsg);
    this.use(plugins.message);
  }
  
  Client.prototype.__proto__ = Emitter.prototype;
  
  Client.prototype.message = function(data, fn){
    data.when = (+new Date());
    if (!this.storage.messages[data.to]) {
      this.storage.messages[data.to] = [data];
    } else {
      this.storage.messages[data.to].push(data);
    }
    setTimeout(fn, 1);
  };
  
  
  Client.prototype.names = function(data, fn){
    data.when = (+new Date());
    this.storage.names[data.channel] = data.names;
    setTimeout(fn, 1);
  };
  
  Client.prototype.topic = function(data, fn){
    data.when = (+new Date());
    //TODO: store data
    setTimeout(fn, 1);
  };
  
  Client.prototype.away = function(data, fn){
    data.when = (+new Date());
    //TODO: store data
    setTimeout(fn, 1);
  };
  
  Client.prototype.quit = function(data, fn){
    data.when = (+new Date());
    //TODO: store data
    setTimeout(fn, 1);
  };
  
  Client.prototype.join = function(data, fn){
    data.when = (+new Date());
    //TODO: store data
    setTimeout(fn, 1);
  };
  
  Client.prototype.part = function(data, fn){
    data.when = (+new Date());
    //TODO: store data
    setTimeout(fn, 1);
  };
  
  Client.prototype.kick = function(data, fn){
    data.when = (+new Date());
    //TODO: store data
    setTimeout(fn, 1);
  };
  
  Client.prototype.nick = function(data, fn){
    data.when = (+new Date());
    //TODO: store data
    setTimeout(fn, 1);
  };
  
  Client.prototype.data = function(data, fn){
    data.when = (+new Date());
    console.log(data.string);
    setTimeout(fn, 1);
  };
  
  Client.prototype.use = function(fn){
    fn(this);
    return this;
  };
  
  return Client;
}));
