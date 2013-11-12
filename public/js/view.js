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
    this.viewStates = ['disconnected', 'connecting', 'connected'];
    this.viewState = ko.observable(this.viewStates[0]);
    this.join = ko.observableArray(['#td-chan1,#td-chan2,#td-chan3']);
    this.me = ko.observable('td-debug');
    
    this.channels = ko.observableArray([]);
  }
  
  MainViewModel.prototype.__proto__ = EventEmitter.prototype;
  
  MainViewModel.prototype.getChannel = function(name){
    return this.channels().filter(function(channel){ 
      return channel.name() === name; 
    })[0];
  };
  
  MainViewModel.prototype.addChannel = function(name){
    this.viewState(this.viewStates[2]);
    this.channels.push(new ChannelViewModel(name));
  };
  
  MainViewModel.prototype.remChannel = function(name){
    if ('string' === typeof name) {
      name = this.getChannel(name);
    }
    console.log(this)
    this.channels.remove(name);
  };
  
  MainViewModel.prototype.addMessage = function(message){
    var channel = this.getChannel(message.to);
    if (!channel) {
      this.addChannel(message.to);
      return this.addMessage(message);
    }
    channel.messages.push(new MessageViewModel(message.from, message.message, message.when));
  };
  
  MainViewModel.prototype.sendMessage = function(model, event){
    if (event.which !== 13) {
      return true;
    }
    var context = ko.contextFor(event.target);
    var msg = {
      from: context.$root.me(),
      to: model.name(),
      string: event.target.value
    };
    context.$root.emit('message', msg);
    event.target.value = '';
  };
  
  MainViewModel.prototype.connect = function(){
    var self = this;
    window.socket.emit('open', self.server, function(){
      window.socket.emit('nick', self.me(), function(){
        window.socket.emit('user', self.me(), self.me(), function(){
          self.join().forEach(function(channel){
            window.socket.emit('join', channel, function(){
              // sent everything and asked to join a channel
              self.viewState(self.viewStates[1]);
            });
          });
        });
      });  
    });
  };
  
  return MainViewModel;
}));