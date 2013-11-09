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
    nick: function(client){
      client.on('data', function(msg){
        if ('nick' !== msg.command) return;
        var e = {};
        e.nick = client.me;
        e.new = msg.params[0];
        client.emit('nick', e.new);
      });
    },
    // TODO: send quit
    quit: function(){},
    join: function(client){
      client.on('data', function(msg){
        if ('join' !== msg.command) return;
        var e = {};
        e.nick = client.me;
        e.channels = msg.params[0];
        e.keys = msg.params[1];
        client.emit('join', e.channels, e.keys);
        client.join(e);
      });
    },
    part: function(client){
      client.on('data', function(msg){
        if ('part' !== msg.command) return;
        var e = {};
        e.nick = client.me;
        e.channels = msg.params[0] || client.storage.channels[client.storage.channels.length-1];
        e.message = msg.params.join(' ');
        client.emit('part', e.channels, e.message);
        client.part(e);
      });
    },
    // TODO: send mode
    mode: function(){},
    topic: function(client){
      client.on('data', function(msg){
        if ('topic' !== msg.command) return;
        var e = {};
        e.nick = client.me;
        e.channel = client.storage.channels[client.storage.channels.length-1];
        e.topic = msg.params.join(' ');
        client.emit('topic', e.channel, e.topic);
        client.topic(e);
      });
    },
    names: function(client){
      client.on('data', function(msg){
        if ('names' !== msg.command) return;
        var e = {};
        e.nick = client.me;
        e.channels = msg.params[0] || client.storage.channels[client.storage.channels.length-1];
        client.emit('names', e.channels);
        client.names(e);
      });
    },
    // TODO: send list
    list: function(){},
    // TODO: send invite
    invite: function(){},
    // TODO: send kick
    kick: function(){},
    message: function(client){
      client.on('data', function(msg){
        if ('' !== msg.command) return;
        var e = {};
        e.from = client.storage.me;
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
        var e = {};
        e.from = client.me;
        e.to = msg.params.shift();
        e.message = msg.params.join(' ');
        client.emit('send', e.to, e.message);
        client.message(e);
      });
    },
    // TODO: send kick
    motd: function(){},
    // TODO: send who
    who: function(){},
    // TODO: send whois
    whois: function(){},
    // TODO: send whowas
    whowas: function(){},
    // TODO: send away
    away: function(){}
  };

  function Client() {
    this.storage = { 
      me: undefined,  // current nick
      channels:[],    // current channels open
      topics: {},     // By channel, topics of channels
      messages: {},   // By channel, messages in channel
      names: {}       // By channel, handles in channel 
    };
    this.parser = new Parser();
    this.parser.on('message', this.emit.bind(this, 'data'));
    this.use(plugins.nick);
    //this.use(plugins.quit);
    this.use(plugins.join);
    this.use(plugins.part);
    //this.use(plugins.mode);
    this.use(plugins.topic);
    this.use(plugins.names);
    //this.use(plugins.list);
    //this.use(plugins.invite);
    //this.use(plugins.kick);
    this.use(plugins.message);
    this.use(plugins.privmsg);
    //this.use(plugins.motd);
    //this.use(plugins.who);
    //this.use(plugins.whois);
    //this.use(plugins.whowas);
    //this.use(plugins.away);
  }
  
  Client.prototype.__proto__ = EventEmitter.prototype;
  
  // TODO: Handle identify
  
  Client.prototype.welcome = function(data, fn){
    data.when = (+new Date());
    this.storage.me = data;
    setTimeout(fn, 1);
  };
  
  Client.prototype.nick = function(data, fn){
    console.log(data);
    if (data.nick === this.storage.me) {
      this.storage.me = data.new;
    }
    //TODO: update stored names
    setTimeout(fn, 1);
  };
  // TODO: recieve quit
  
  Client.prototype.join = function(data, fn){
    data.when = (+new Date());
    // TODO: if its another user update names store
    // If its you update channels list 
    if (data.nick === this.storage.me) {
      this.storage.channels = this.storage.channels.concat(data.channels).unique();
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.part = function(data, fn){
    var channels, channel, i;
    data.when = (+new Date());
    // TODO: update names store
    // If its you remove from channels
    if (data.nick === this.storage.me) {
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

  // TODO: recieve mode
  //      ":ChanServ!ChanServ@services. MODE #257 +imo cmilhench"
  
  Client.prototype.topic = function(data, fn){
    data.when = (+new Date());
    this.storage.topics[data.channel] = data;
    setTimeout(fn, 1);
  };
  
  Client.prototype.names = function(data, fn){
    data.when = (+new Date());
    this.storage.names[data.channel] = data.names;
    setTimeout(fn, 1);
  };
  
  // TODO: recieve list
  // TODO: recieve invite
  // TODO: recieve kick
  
  Client.prototype.message = function(data, fn){
    data.when = (+new Date());
    if (!this.storage.messages[data.to]) {
      this.storage.messages[data.to] = [data];
    } else {
      this.storage.messages[data.to].push(data);
    }
    setTimeout(fn, 1);
  };

  // TODO: recieve motd
  // TODO: recieve who
  // TODO: recieve whois
  // TODO: recieve whowas
  // TODO: recieve away

  // TODO: recieve mode
  
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
