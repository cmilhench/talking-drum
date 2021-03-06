// -----------------------------------------------------------------
//  client.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint browser:true */
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
    oper: function(client){
      client.on('data', function(msg){
        if ('oper' !== msg.command) return;
        var e = {};
        e.name = msg.params[0];
        e.pass = msg.params[1];
        client.emit('oper', e.name, e.pass);
      });
    },
    nick: function(client){
      client.on('data', function(msg){
        if ('nick' !== msg.command) return;
        var e = {};
        e.nick = msg.from;
        e.new = msg.params[0];
        client.emit('nick', e.new);
      });
    },
    join: function(client){
      client.on('data', function(msg){
        if ('join' !== msg.command) return;
        var e = {};
        e.nick = msg.from;
        e.channels = msg.params[0];
        e.keys = msg.params[1];
        client.emit('join', e.channels, e.keys);
      });
    },
    part: function(client){
      client.on('data', function(msg){
        if ('part' !== msg.command) return;
        var e = {};
        e.nick = msg.from;
        e.channels = msg.params[0] || msg.to;
        e.message = msg.params.slice(1).join(' ');
        client.emit('part', e.channels, e.message);
      });
    },
    // /mode cmilhench +i
    // /mode #chan +o cmilhench
    mode: function(client){
      client.on('data', function(msg){
        if ('mode' !== msg.command) return;
        var e = {};
        e.target = msg.params[0];
        e.flags = msg.params[1];
        e.params = msg.params[2];
        client.emit('mode', e.target, e.flags, e.params);
      });
    },
    topic: function(client){
      client.on('data', function(msg){
        if ('topic' !== msg.command) return;
        var e = {};
        e.nick = msg.from;
        e.channel = msg.to;
        e.topic = msg.params.join(' ');
        client.emit('topic', e.channel, e.topic);
      });
    },
    names: function(client){
      client.on('data', function(msg){
        if ('names' !== msg.command) return;
        var e = {};
        e.nick = msg.from;
        e.channel = msg.params[0] || msg.to;
        client.emit('names', e.channel, function(err, data){
          client.names({ channel:e.channel, names:data });
        });
      });
    },
    // TODO: send list
    list: function(){},
    // /invite cmilhench #chan
    invite: function(client){
      client.on('data', function(msg){
        if ('invite' !== msg.command) return;
        var e = {};
        e.name = msg.params[0];
        e.channel = msg.params[1];
        client.emit('invite', e.name, e.channel);
      });
    },
    // TODO: send kick
    kick: function(){},
    message: function(client){
      client.on('data', function(msg){
        if ('' !== msg.command) return;
        var e = {};
        e.from = msg.from;
        e.to = msg.to;
        e.message = msg.string;
        if (e.to === '*') {
          client.emit('write', e.message);
        } else {
          client.emit('send', e.to, e.message);
        }
        client.message(e);
      });
    },
    privmsg: function(client){
      client.on('data', function(msg){
        if ('msg' !== msg.command) return;
        var e = {};
        e.from = msg.from;
        e.to = msg.params.shift();
        e.message = msg.params.join(' ');
        client.emit('send', e.to, e.message);
        client.message(e);
      });
    },
    notice: function(client){
      client.on('data', function(msg){
        if ('notice' !== msg.command) return;
        var e = {};
        e.from = msg.from;
        e.to = msg.params.shift();
        e.message = msg.params.join(' ');
        client.emit('notice', e.to, e.message);
      });
    },
    // TODO: send motd
    motd: function(){},
    who: function(client){
      client.on('data', function(msg){
        if ('who' !== msg.command) return;
        var e = {};
        e.mask = msg.params[0];
        e.params = msg.params[1];
        client.emit('who', e.mark, e.params);
      });
    },
    whois: function(client){
      client.on('data', function(msg){
        if ('whois' !== msg.command) return;
        var e = {};
        e.target = msg.params[0];
        e.params = msg.params[1];
        client.emit('whois', e.target, e.params);
      });
    },
    whowas: function(client){
      client.on('data', function(msg){
        if ('whowas' !== msg.command) return;
        var e = {};
        e.nick = msg.params[0];
        e.count = msg.params[1];
        e.target = msg.params[2];
        client.emit('whowas', e.message);
      });
    },
    away: function(client){
      client.on('data', function(msg){
        if ('away' !== msg.command) return;
        var e = {};
        e.nick = msg.from;
        e.message = msg.params.join(' ');
        client.emit('away', e.message);
      });
    },
    quit: function(client){
      client.on('data', function(msg){
        if ('quit' !== msg.command) return;
        client.emit('quit', msg.params.join(' '));
      });
    },
    clear: function(client){
      client.on('data', function(msg){
        if ('clear' !== msg.command) return;
        client.clear(msg.to);
      });
    }
  };

  function Client(model) {
    if (!(this instanceof Client)) return new Client(model);
    this.model = model;
    this.parser = new Parser();
    this.parser.on('message', this.emit.bind(this, 'data'));
    if (model) {
      this.model.on('message', this.parser.line.bind(this.parser));
      this.model.on('open', this.open.bind(this));
    }
    this.use(plugins.oper);
    this.use(plugins.nick);
    this.use(plugins.quit);
    this.use(plugins.join);
    this.use(plugins.part);
    this.use(plugins.mode);
    this.use(plugins.topic);
    this.use(plugins.names);
    //this.use(plugins.list);
    this.use(plugins.invite);
    //this.use(plugins.kick);
    this.use(plugins.message);
    this.use(plugins.privmsg);
    this.use(plugins.notice);
    //this.use(plugins.motd);
    this.use(plugins.who);
    this.use(plugins.whois);
    this.use(plugins.whowas);
    //this.use(plugins.away);
    this.use(plugins.clear);
  }
  
  Client.prototype.__proto__ = EventEmitter.prototype;
  
  // Client.prototype.emit = function(){
//     var name = arguments[0];
//     delete arguments[0];
//     console.log('client.emit(\'' + name + '\')', arguments);
//     EventEmitter.prototype.emit.apply(this, arguments);
//   };
  
  Client.prototype.welcome = function(data, fn){
    this.model.me(data);
    setTimeout(fn, 1);
  };
  
  Client.prototype.nick = function(data, fn){
    if (data.nick === this.model.me()) {
      this.model.me(data.new);
    }
    for (var i = this.model.channels().length - 1; i >= 0; i--) {
      var channel = this.model.channels()[i];
      channel.names.remove(data.nick);
      channel.names.push(data.new);
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.join = function(data, fn){
    var channel;
    if (data.nick === this.model.me()) {
      while(data.channels && (channel = data.channels.pop())) {
        if (!channel) break;
        if (!this.model.getChannel(channel)) {
          this.model.addChannel(channel);
        }
      }
      if (data.channel && !this.model.getChannel(data.channel)) {
        this.model.addChannel(data.channel);
      }
    } else {
      channel = this.model.getChannel(data.channel);
      channel.names.push(data.nick);
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.part = function(data, fn){
    var channel;
    console.log(data);
    if (data.nick === this.model.me()) {
      while(data.channels && (channel = data.channels.pop())) {
        if (!channel) break;
        this.model.remChannel(channel);
      }
      if (data.channel && this.model.getChannel(data.channel)) {
        this.model.remChannel(data.channel);
      }
    } else if (data.channel) {
      channel = this.model.getChannel(data.channel);
      channel.names.remove(data.nick);
    }
    setTimeout(fn, 1);
  };

  // TODO: recieve mode
  //      ":ChanServ!ChanServ@services. MODE #257 +imo cmilhench"
  
  Client.prototype.topic = function(data, fn){
    this.model.getChannel(data.channel).topic(data.topic);
    setTimeout(fn, 1);
  };
  
  Client.prototype.names = function(data, fn){
    var channel = this.model.getChannel(data.channel);
    channel.names(data.names);
    setTimeout(fn, 1);
  };
  
  // TODO: recieve list
  // TODO: recieve invite
  // TODO: recieve kick
  
  Client.prototype.notice = 
  Client.prototype.message = function(data, fn){
    data.when = (+new Date());
    // if this is a direct message create a channel between `me` and the
    // *sender* so that it to appear in the correct place in the ui
    if (data.to.toLowerCase() === this.model.me().toLowerCase()){
      data.to = data.from;
    }
    this.model.addMessage(data);
    setTimeout(fn, 1);
  };

  // TODO: recieve motd
  // TODO: recieve who
  // TODO: recieve whois
  // TODO: recieve whowas
  Client.prototype.away = function(data, fn){
    // Away messages are currently not printed to the screen
    // var message = { 
    //   to: data.nick, 
    //   from : 'auto response from ' + data.nick, 
    //   message: data.message, 
    //   when: (+new Date())
    // };
    // this.model.addMessage(message);
    setTimeout(fn, 1);
  };
  
  Client.prototype.clear = function(data, fn){
    var channel = this.model.getChannel(data);
    if (channel){
      channel.messages([]);
    }
    setTimeout(fn, 1);
  };

  // TODO: recieve mode
  
  Client.prototype.data = function(data, fn){
    var nolog = [
      'NICK','PRIVMSG','NOTICE',
      'TOPIC','RPL_TOPIC',
      'RPL_NAMREPLY','RPL_ENDOFNAMES',
      'JOIN','PART','QUIT'
    ];
    if (true || nolog.indexOf(data.command) === -1) {
      console.debug(data.string);
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.quit = function(data, fn){
    if (data.nick !== this.model.me()) {
      for (var i = this.model.channels().length - 1; i >= 0; i--) {
        var channel = this.model.channels()[i];
        channel.names.remove(data.nick);
      }
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.err = function(data, fn){
    switch (data.command) {
      case 'ERR_ERRONEUSNICKNAME':
      case 'ERR_NICKNAMEINUSE':
      case 'ERR_UNAVAILRESOURCE':
      case 'ERR_UNKNOWNCOMMAND':
        data.from = '*';
        data.to = this.model.me();
        return this.notice(data, fn);
      case 'ERR_NOTREGISTERED':
        data.from = data.params[0];
        data.to = this.model.me();
        return this.notice(data, fn);
      default:
        console.error(data.message);
    }
    setTimeout(fn, 1);
  };
  
  Client.prototype.open = function(){
    var self = this;
    window.onbeforeunload = function() { 
      return 'Looks like your currently connected'; 
    };
    self.emit('open', self.model.server, function(){
      self.model.viewState('opening');
      self.emit('nick', self.model.me(), function(){
        self.emit('user', self.model.me(), self.model.me(), function(){
          if (self.model.join()) {
            self.emit('join', self.model.join(), function(){
              // sent everything and asked to join channels
            });
          }
        });
      });  
    });  
  };
  
  Client.prototype.close = function(data, fn){
    window.onbeforeunload = null;
    this.model.channel(undefined);
    this.model.channels([]);
    this.model.viewState('closed');
    setTimeout(fn, 1);
  };
  
  Client.prototype.use = function(fn){
    fn(this);
    return this;
  };
  
  return Client;
}));
