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
      nick: 'colinm1',
      chan: ['#zarniwoop'],
      user: {  }
    }
  };
  
  var template = {
    part : '<p>%s</p>',
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
    ].map(function(line){ return line.replace(/^\s+|\s+$/g, ''); }).join('')
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
  
  // -----------------------------------------------------------------
  //  listen to socket events
  var irc = window.io.connect('http://localhost:3000/irc');
  var socket = irc.on('connect', function () {
    
    var send = ['pass','nick','user','send','join','part'];
    var down = ['message','names','topic','away','quit','join','part','kick','nick','data'];
    
    send.forEach(function(event){
      client.on(event, socket.emit.bind(socket, event));
    });
    down.forEach(function(event){
      socket.on(event, client[event].bind(client));
    });
    
    socket.on('disconnect', function() {
      send.forEach(function(event){
        client.removeAllListeners(event);
      });
      down.forEach(function(event){
        socket.removeAllListeners(event);
      });
      form.find('.btn-primary').addClass('disabled');
    });
    
    if (model.config) {
      socket.emit('open', model.config, function(){
        socket.emit('nick', model.config.nick, function(){
          client.storage.nick = model.config.nick;
          socket.emit('user', model.config.nick, model.config.nick, function(){
            model.config.chan.forEach(function(channel){
              socket.emit('join', channel, function(){
                // sent everything and asked to join a channel
                client.storage.channel = channel;
              });
            });
          });
        });  
      });
    } else {
      form.find('.btn-primary').removeClass('disabled');
    }

  });
  
  // -----------------------------------------------------------------
  //  Globals
  
  var form      = $('.form-signin');
  var panelMain = document.querySelector('.panel');
  var panelBody = document.querySelector('.panel-body');
  var panelFoot = document.querySelector('.panel-footer');
  var inputArea = document.querySelector('textarea');
  
  // -----------------------------------------------------------------
  //  Behaviours
  
  function resize(){
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
  
  function submit(event) {
    event.preventDefault();
    var port = form.find('input[name="port"]').val() || 6667;
    var host = form.find('input[name="host"]').val() || 'irc.freenode.org';
    var nick = form.find('input[name="nick"]').val();
    var name = form.find('input[name="name"]').val();
    var pass = form.find('input[name="pass"]').val();
    var chan = form.find('input[name="chan"]').val().split(',') || [];
    
    chan = chan.filter(function(element){ return element.replace(/^\s+|\s+$/g, ''); });
    
    model.config = {
      host: { port: port, host: host },
      nick: nick,
      chan: chan,
      user: { name: name, real: name, pass: pass }
    };
    socket.emit('open', model.config, function(){ 
      form.hide();
    });
  }
  
  function clear() {
    while (panelBody.firstChild) panelBody.removeChild(panelBody.firstChild);
    client.storage.messages[model.config.chan[0]] = [];
  }
  
  function render(){
    var start = +new Date();
    var messages = client.storage.messages[model.config.chan[0]];
    var rendered = panelBody.querySelectorAll('p').length;
    var fragment, lastFrom, last, lastTime, isodate, isotime;
    var flood = 50;
    for (var i = rendered; i < messages.length; i++) {
      // Process as many as we can before the flood, otherwise break
      if (+new Date() - start >= flood) break;
      last = panelBody.querySelector('li:last-child');
      if (last) {
        lastFrom = last.querySelector('cite').innerText;
        lastTime = last.querySelector('time').innerText;
      }
      isodate = (new Date(messages[i].when)).toISOString();
      isotime = isodate.substr(11,5);
      fragment = document.createElement('div');
      if (messages[i].from === lastFrom && isotime === lastTime) {
        fragment.innerHTML = printf(template.part, messages[i].message);
        last.querySelector('p:last-child').appendChild(fragment.firstChild);
      } else {
        fragment.innerHTML = printf(template.full, messages[i].from, isodate, isotime, messages[i].message);
        panelBody.appendChild(fragment.firstChild);
      }
    }
    resize();
    // render more if there are any, otherwise render again is a while
    // (i.e. the rendered count is lower than message count);
    if (i < messages.length) { 
      setTimeout(render, 1); 
    } else {
      setTimeout(render, 1000); 
    }
  }
  
  function typing(event) {
    var data;
    if (event.which === 13 && !event.shiftKey) {
      event.preventDefault();
      data = { 
        from:model.config.nick, 
        to:model.config.chan[0], 
        message:inputArea.value, 
        when:(+new Date())
      };
      inputArea.value = '';
      client.parser.line(data.message);
      setTimeout(render, 1);
    }
  }
  
  // -----------------------------------------------------------------
  //  Main
  
  clear();
  window.addEventListener('resize', resize);
  inputArea.addEventListener('keyup', typing);
  form.get(0).addEventListener('submit', submit);
  setTimeout(render, 1);
  
  return model;
}));