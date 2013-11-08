// -----------------------------------------------------------------
//  client.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint browser:true, jquery:true */
/* jshint -W103, -W084 */

(function(factory){
  window.Client = factory(window.EventEmitter, window.Parser);
}(function(EventEmitter, Parser){
  
  Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j]) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  };
  
  var plugins = {
    message: function(client){
      client.on('data', function(msg){
        if ('' !== msg.command) return;
        var e = {};
        e.from = client.storage.nick;
        //TODO: what channel
        e.to = client.storage.channels[client.storage.channels.length-1];
        e.message = msg.string;
        client.emit('send', e.to, e.message);
        client.message(e);
      });
    },
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
    names: function(client){
      client.on('data', function(msg){
        if ('names' !== msg.command) return;
        var e = {};
        e.nick = client.storage.nick;
        e.channels = msg.params || client.storage.channels[client.storage.channels.length-1];
        client.emit('names', e.channels);
        client.names(e);
      });
    },
    topic: function(client){
      client.on('data', function(msg){
        if ('topic' !== msg.command) return;
        var e = {};
        e.nick = client.storage.nick;
        e.channel = client.storage.channels[client.storage.channels.length-1];
        e.topic = msg.params;
        client.emit('topic', e.channel, e.topic);
        client.topic(e);
      });
    },
    join: function(client){
      client.on('data', function(msg){
        if ('join' !== msg.command) return;
        var e = {};
        e.nick = client.storage.nick;
        e.channels = msg.params;
        client.emit('join', e.channels);
        client.join(e);
      });
    },
    part: function(client){
      client.on('data', function(msg){
        if ('part' !== msg.command) return;
        var e = {};
        e.nick = client.storage.nick;
        e.message = '';
        //TODO: what channel
        e.channels = msg.params || client.storage.channels[client.storage.channels.length-1];
        client.emit('part', e.channels);
        client.part(e);
      });
    }
  };

  function Client() {
    var self = this;
    this.storage = { nick: undefined, channels:[], topic: {}, messages: {}, names: {} };
    this.parser = new Parser();
    this.parser.on('message', self.emit.bind(self, 'data'));
    this.use(plugins.message);
    this.use(plugins.privmsg);
    this.use(plugins.names);
    this.use(plugins.topic);
    this.use(plugins.join);
    this.use(plugins.part);
    //this.use(plugins.nick);
    //this.use(plugins.kick);
    //this.use(plugins.away);
    //this.use(plugins.quit);
    //this.use(plugins.mode);
  }
  
  Client.prototype.__proto__ = EventEmitter.prototype;
  
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
    this.storage.topic[data.channel] = data;
    setTimeout(fn, 1);
  };
  
  Client.prototype.join = function(data, fn){
    data.when = (+new Date());
    // TODO: if its another user update names store
    // If its you remove from 
    if (data.nick === this.storage.nick) {
      this.storage.channels = this.storage.channels.concat(data.channels).unique();
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.part = function(data, fn){
    var channels, channel, i;
    data.when = (+new Date());
    // TODO: update names store
    // If its you remove from channels
    if (data.nick === this.storage.nick) {
      channels = data.channels ? data.channels.split(',') : undefined;
      while(channels && (channel = channels.pop())) {
        i = this.storage.channels.indexOf(channel);
        if (i > -1) {
          this.storage.channels = this.storage.channels.splice(i, 1);
        }
      }
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.welcome = function(data, fn){
    data.when = (+new Date());
    this.storage.nick = data;
    setTimeout(fn, 1);
  };

  // TODO: send nick
  // TODO: send kick
  // TODO: send away
  // TODO: send quit
  // TODO: send mode
  
  // TODO: recieve nick
  // TODO: recieve kick
  // TODO: recieve away
  // TODO: recieve quit
  
  // TODO: recieve mode
  //      ":ChanServ!ChanServ@services. MODE #257 +imo cmilhench"
  
  // TODO: Handle identify
  
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
