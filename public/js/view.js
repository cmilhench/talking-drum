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
  }

  function ChannelViewModel(name, topic, names) {
    var self = this;
    self.name = ko.observable(name);
    self.topic = ko.observable(topic);
    self.names = ko.observableArray(names);
    self.messages = ko.observableArray([]);
  }

  function MainViewModel() {
    this.server = { host: 'irc.freenode.org', port: 6667 };
    this.viewStates = ['disconnected','closed', 'opening', 'opened'];
    this.viewState = ko.observable('disconnected');
    this.join = ko.computed({
      read: function () {
        if (!this['join']) return '#td-c1,#td-c2';
        try { return JSON.parse(this['join']); } finally{}
      },
      write: function (value) { this['join'] = JSON.stringify(value); },
      owner: window.localStorage
    });
    this.me = ko.computed({
      read: function () {
        if (!this['me']) return 'td-debug2';
        try { return JSON.parse(this['me']); } finally{}
      },
      write: function (value) { this['me'] = JSON.stringify(value); },
      owner: window.localStorage
    });
    this.channels = ko.observableArray([]);
  }
  
  MainViewModel.prototype.__proto__ = EventEmitter.prototype;
  
  MainViewModel.prototype.getChannel = function(name){
    return this.channels().filter(function(channel){ 
      return channel.name().toLowerCase() === name.toLowerCase(); 
    })[0];
  };
  
  MainViewModel.prototype.addChannel = function(name){
    this.viewState('opened');
    this.channels.push(new ChannelViewModel(name));
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
    var context = ko.contextFor(event.target);
    var me = context.$root.me().toLowerCase();
    if (event.which === 38) {
      var last = model.messages().filter(function(message){
        return message.from().toLowerCase() === me;
      });
      last = last[last.length-1];
      if (last) { event.target.value = last.text(); }
    }
    if (event.which === 13) {
      var msg = {
        from: context.$root.me(),
        to: model.name(),
        string: event.target.value
      };
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