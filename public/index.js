// -----------------------------------------------------------------
//  index.js
//  
//  irc.milhen.ch
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint browser:true, jquery:true */
/* jshint -W015 */

(function(factory){
  'use strict';
  window.model = factory();
}(function(){
  'use strict';

  var model = {
    config: {
      host: { port: 6667, host: 'irc.freenode.org' },
      nick: 'colinm-td',
      chan: ['#talking-drum'],
      user: {  }
    }
  };
  
  var template = {
    list: [    
      '<div id="%s" class="panel panel-default">',
      '  <!-- Default panel contents -->',
      '  <div class="panel-heading">',
      '    <strong>%s</strong>',
      '    <span>&nbsp;&mdash;&nbsp;</span>',
      '    <span title="%s">%s</span>',
      '  </div>',
      '  <ol class="panel-body list-group"></ol>',
      '  <div class="panel-footer">',
      '    <textarea></textarea>',
      '  </div>',
      '</div>'
    ].map(function(line){ return line.replace(/^\s+|\s+$/g, ''); }).join(''),
    full : [
      '<li class="list-group-item">',
      '  <blockquote>',
      '    <header>',
      '      <cite class="author">%s</cite>&nbsp;',
      '      <time title="%s">%s</time>',
      '    </header>',
      '    <p>%s</p>',
      '  </blockquote>',
      '</li>'
    ].map(function(line){ return line.replace(/^\s+|\s+$/g, ''); }).join(''),
    part : '<p>%s</p>'
  };
    
  // -----------------------------------------------------------------
  // Private functions
  
  function printf(format) {
    var argv = Array.prototype.splice.call(arguments,1);
    var i = 0, len = argv.length;
    return String(format).replace(/%[sd%]/g, function(token) {
      if (i >= len) return token;
      switch (token) {
        case '%s': return String(argv[i++]);
        case '%d': return Number(argv[i++]);
        case '%%': return '%'; 
        default: return token;
      }
    });
  }
    
  // -----------------------------------------------------------------
  
    var client = new window.Client();
    window.client = client;
    
  // -----------------------------------------------------------------
  //  listen to socket events
  var irc = window.io.connect('http://localhost:3000/irc');
  var socket = irc.on('connect', function () {
    
    var send = ['pass','nick','user','send','join','part'];
    var recv = ['message','names','topic','join','part',/*'nick',*/'data'];
    
    send.forEach(function(event){
      client.on(event, socket.emit.bind(socket, event));
    });
    recv.forEach(function(event){
      socket.on(event, client[event].bind(client));
    });
    
    socket.on('disconnect', function() {
      send.forEach(function(event){
        client.removeAllListeners(event);
      });
      recv.forEach(function(event){
        socket.removeAllListeners(event);
      });
      //form.find('.btn-primary').addClass('disabled');
    });
    
    if (model.config) {
      socket.emit('open', model.config, function(){
        socket.emit('nick', model.config.nick, function(){
          client.storage.nick = model.config.nick;
          socket.emit('user', model.config.nick, model.config.nick, function(){
            model.config.chan.forEach(function(channel){
              socket.emit('join', channel, function(){
                // sent everything and asked to join a channel
              });
            });
          });
        });  
      });
    } else {
      //form.find('.btn-primary').removeClass('disabled');
    }

  });
  
  // -----------------------------------------------------------------
  //  Globals
  
  // -----------------------------------------------------------------
  //  Behaviours
  
  function resize(){
    //TODO: support multiple
    var panelMain = document.querySelector('.panel');
    if (!panelMain) return;
    var panelBody = document.querySelector('.panel-body');
    var panelFoot = document.querySelector('.panel-footer');
    var panelStyle = window.getComputedStyle(panelMain);
    var marginTop = parseInt(panelStyle['margin-top'], 10);
    var marginBot = parseInt(panelStyle['margin-bottom'], 10);
    var spaceLeft = 0;
    panelBody.style['max-height'] = '100%';
    panelFoot.style['min-height'] = '80px';
    spaceLeft = window.innerHeight - (marginTop + panelMain.offsetHeight + marginBot);
    // scroll the body if the page height causes foot to be off screen 
    if (spaceLeft < 0) {
      panelBody.style['max-height'] = (panelBody.offsetHeight + spaceLeft)-20 + 'px';
      panelBody.scrollTop = panelBody.scrollHeight;
    }
    // stretch the foot if the page height short
    if (spaceLeft > 0) {
      panelFoot.style['min-height'] = (panelFoot.offsetHeight + spaceLeft)-20 + 'px';
    }
  }
  
  // function submit(event) {
  //   event.preventDefault();
  //   var port = form.find('input[name="port"]').val() || 6667;
  //   var host = form.find('input[name="host"]').val() || 'irc.freenode.org';
  //   var nick = form.find('input[name="nick"]').val();
  //   var name = form.find('input[name="name"]').val();
  //   var pass = form.find('input[name="pass"]').val();
  //   var chan = form.find('input[name="chan"]').val().split(',') || [];
  //   
  //   chan = chan.filter(function(element){ return element.replace(/^\s+|\s+$/g, ''); });
  //   
  //   model.config = {
  //     host: { port: port, host: host },
  //     nick: nick,
  //     chan: chan,
  //     user: { name: name, real: name, pass: pass }
  //   };
  //   socket.emit('open', model.config, function(){ 
  //     form.hide();
  //   });
  // }
  
  function render(){
    var i, channel, channels = client.storage.channels;
    for (i = 0; channels && i < channels.length; i++) {
      channel = client.storage.channels[i];
      renderMessages(channel);
    }
    resize();
    setTimeout(render, 1000); 
  }
  
  function renderMessages(channel){
    var i, message, messages = client.storage.messages[channel];
    var topic = '';
    var selector = '#channel'+channel.substring(1);
    var container = document.querySelector(selector);
    var fragment = document.createElement('div');
    var last, lastFrom, lastTime, isodate, isotime;
    if (!container) {
      fragment.innerHTML = printf(template.list, selector.substring(1), channel, topic, topic);
      container = fragment.firstChild;
      document.querySelector('.container').appendChild(container);
      container.querySelector('textarea').addEventListener('keyup', typing);
    }
    var list = container.querySelector('ol');
    var rendered = list.querySelectorAll('p').length;
    for (i = rendered; messages && i < messages.length; i++) {
      message = messages[i];
      isodate = (new Date(message.when)).toISOString();
      isotime = isodate.substr(11,5);
      last = list.querySelector('li:last-child');
      if (last) {
        lastFrom = last.querySelector('cite').innerText;
        lastTime = last.querySelector('time').innerText;
      }
      if (messages[i].from === lastFrom && isotime === lastTime) {
        fragment.innerHTML = printf(template.part, messages[i].message);
        last.querySelector('p:last-child').appendChild(fragment.firstChild);
      } else {
        fragment.innerHTML = printf(template.full, messages[i].from, isodate, isotime, messages[i].message);
        list.appendChild(fragment.firstChild);
      }
    }
  }
  
  function typing(event) {
    if (event.which === 13 && !event.shiftKey) {
      event.preventDefault();
      client.parser.line(event.target.value);
      event.target.value = '';
      setTimeout(render, 1);
    }
  }
  
  // -----------------------------------------------------------------
  //  Main
  
  window.addEventListener('resize', resize);
  setTimeout(render, 1);
  
  return model;
}));