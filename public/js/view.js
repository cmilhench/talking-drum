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
  window.ViewModel = factory(window.EventEmitter, window.ko);
}(function(EventEmitter, ko){
  
  function MessageViewModel(from, text, when) {
    var self = this;
    self.from = ko.observable(from);
    self.text = ko.observable(text);
    self.when = ko.observable(when);
    self.date = ko.computed(function(){
      return new Date(self.when()).toISOString();
    });
    self.time = ko.computed(function(){
      return self.date().substr(11,5);
    });
    self.seen = ko.observable(false);
    self.rendered = function(){
      var element = arguments[0][1];
      var context = ko.contextFor(element);
      self.seen(true);
      var prev = context.$parent.messages()[context.$index()-1];
      if (prev && prev.from() === self.from() && prev.time() === self.time()) {
        element.parentNode.classList.add('followon');
      }
    };
  }

  function ChannelViewModel(name, topic, names) {
    var self = this;
    self.name = ko.observable(name);
    self.topic = ko.observable(topic);
    self.names = ko.observableArray(names);
    self.messages = ko.observableArray([]);
    this.history = [];
    self.totalUnseen = ko.computed(function() {
      return self.messages().filter(function(m){ 
        return !m.seen(); 
      }).length;
    }); 
  }

  function MainViewModel() {
    var self = this;
    this.server = { host: 'irc.freenode.org', port: 6667 };
    this.viewStates = ['disconnected','closed', 'opening', 'opened'];
    this.viewState = ko.observable('disconnected');
    this.me = ko.observable('td-debug');
    this.join = ko.observable('#td-debug');
    this.channels = ko.observableArray([]);
    this.channel = ko.observable();
    self.totalUnseen = ko.computed(function() {
      return self.channels().map(function(c){ 
        return c.totalUnseen();
      }).reduce(function(a,b){ 
        return a + b; 
      }, 0);
    }); 
  }
  
  MainViewModel.prototype.__proto__ = EventEmitter.prototype;
  
  MainViewModel.prototype.getChannel = function(name){
    return this.channels().filter(function(channel){ 
      return channel.name().toLowerCase() === name.toLowerCase(); 
    })[0];
  };
  
  MainViewModel.prototype.addChannel = function(name){
    this.channels.push(new ChannelViewModel(name));
    if (!this.channel() || this.channel().name() !== 'NickServ') {
      if (name !== 'ChanServ') {
        this.channel(this.channels()[this.channels().length-1]);
      }
    }
    if (this.channels().length === 1) {
      this.viewState('opened');
    }
  };
  
  MainViewModel.prototype.remChannel = function(name){
    if ('string' === typeof name) {
      name = this.getChannel(name);
    }
    this.channels.remove(name);
  };
  
  MainViewModel.prototype.addMessage = function(message){
    var channel = this.getChannel(message.to);
    var from = message.from;
    var text = message.message;
    var when = message.when;
    if (!channel) {
      this.addChannel(message.to);
      return this.addMessage(message);
    }
    var d = document.createElement('div');
    d.innerText = text.replace(/^\s+|\s+$/g, '');
    text = d.innerHTML;
    text = text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@@#\/%?=~_|!:,.;]*[-A-Z0-9+&@@#\/%=~_|])/ig, '<a href="$1" target="_blank" rel="nofollow">$1</a>');
    text = text.replace(new RegExp('(' + this.me() + ')','i'), '<b>$1</b>');
    text = text.replace(/(.*?)\u0002(.*?)\u0002(.*?)/g,'$1<b>$2</b>$3');
    text = text.replace(/(.*?)\u0016(.*?)\u0016(.*?)/g,'$1<em>$2</em>$3');
    channel.messages.push(new MessageViewModel(from, text, when));
  };
  
  MainViewModel.prototype.sendMessage = function(model, event){
    var i, context = ko.contextFor(event.target);
    if (event.which === 38) {
      i = model.history.indexOf(event.target.value);
      if (i === -1) { i = model.history.length; }
      if (model.history[i-1]) { event.target.value = model.history[i-1]; }
    }
    if (event.which === 40) {
      i = model.history.indexOf(event.target.value);
      if (model.history[i+1]) { event.target.value = model.history[i+1]; }
    }
    if (event.which === 13) {
      var msg = {
        from: context.$root.me(),
        to: model.name(),
        string: event.target.value.replace(/^\s+|\s+$/g, '')
      };
      if (!msg.string) { return; }
      model.history.push(msg.string);
      context.$root.emit('message', msg);
      event.target.value = '';
    }
  };
  
  
  MainViewModel.prototype.sendPart = function(model){
    var context = ko.contextFor(event.target);
    if (context.$root.channels().length <= 1) { return; }
    if (model.name()[0] === '#') {
      var msg = {
        from: context.$root.me(),
        to: model.name(),
        string: '/part'
      };
      context.$root.emit('message', msg);
    } else {
      context.$root.channels.remove(model);
    }
  };
  
  MainViewModel.prototype.connect = function(){
    var self = this;
    if (!self.me()) { return; }
    window.socket.emit('open', self.server, function(){
      window.socket.emit('nick', self.me(), function(){
        window.socket.emit('user', self.me(), self.me(), function(){
          self.viewState('opening');
          var join = self.join();
          join = Array.isArray(join) ? join : join.split(','); 
          join.forEach(function(channel){
            window.socket.emit('join', channel, function(){
              // sent everything and asked to join a channel
            });
          });
        });
      });  
    });
  };
  
  return MainViewModel;
}));