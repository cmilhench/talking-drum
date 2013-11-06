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
      nick: 'colinm3',
      chan: ['#zarniwoop'],
      user: {  }
    },
    names: { '#test': ['blot','cmilhench','colinm'] },
    messages: { '#test': [
      {},
      {},
      {},
      {},
      {},
      { from:'cmilhench', to:'#test', message:'Hey colinm, can you remember if the time tag is supported in chrome?', when: 1383753960000},
      { from:'colinm', to:'#test', message:'I think it is, why not just give it a go?', when: 1383753990000},
      { from:'cmilhench', to:'#test', message:'Arrrg! network issues', when: 1383754590000},
      { from:'cmilhench', to:'#test', message:'seems to be working', when: 1383755115000},
      { from:'cmilhench', to:'#test', message:'again now', when: 1383755130000},
      { from:'colinm', to:'#test', message:'(y)', when:1383755145000}
    ]}
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
  //  listen to socket events
  var irc = window.io.connect('http://localhost:3000/irc');
  var socket = irc.on('connect', function () {
    socket.on('message', function(data){
      data.when = (+new Date());
      if (!model.messages[data.to]) {
        model.messages[data.to] = [data];
      } else {
        model.messages[data.to].push(data);
      }
      console.log('< ', data);
      setTimeout(render, 1);
    });
    socket.on('names', function(data){
      data.when = (+new Date());
      model.names[data.channel] = data.names;
      console.log('< ', data);
    });
    socket.on('data', function(data) {
      console.log('< ', data.string);
    });
    socket.on('topic', function(data) {
      console.log('< ', data.string);
    });
    socket.on('disconnect', function() {
      socket.removeAllListeners('message');
      socket.removeAllListeners('names');
      socket.removeAllListeners('data');
      form.find('.btn-primary').addClass('disabled');
    });
    
    if (model.config) {
      socket.emit('open', model.config, function(){});
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
    model.messages[model.config.chan[0]] = [];
  }
  
  function render(){
    var start = +new Date();
    var messages = model.messages[model.config.chan[0]];
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
    // render more if there are any 
    // (i.e. the rendered count is lower than message count);
    if (i < messages.length) { setTimeout(render, 1); }
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
      // TODO: parse for commands.
      if (/\/clear/i.test(data.message)) { 
        return clear();
      }
      if (!model.messages[data.to]) {
        model.messages[data.to] = [data];
      } else {
        model.messages[data.to].push(data);
      }
      console.log('> ', data);
      socket.emit('send', data);
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