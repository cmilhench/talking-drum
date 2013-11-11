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
    this.me = ko.observable('colinm');
    this.channels = ko.observableArray([]);
  }
  
  MainViewModel.prototype.__proto__ = EventEmitter.prototype;
  
  MainViewModel.prototype.getChannel = function(name){
    return this.channels().filter(function(channel){ 
      return channel.name() === name; 
    })[0];
  };
  
  MainViewModel.prototype.addChannel = function(name){
    this.channels.push(new ChannelViewModel(name));
  };
  
  MainViewModel.prototype.remChannel = function(name){
    var channel = this.getChannel(name);
    this.channels.remove(channel);
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
  
  return MainViewModel;
}));