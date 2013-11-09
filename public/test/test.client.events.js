// -----------------------------------------------------------------
//  test.client.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint -W117 */

var Client = window.Client;

describe('Client Events', function(){
  
  describe('on /nick [...]', function(){
    it('should emit "nick"');
    it.skip('should call this.nick()', function(done){
      var client, called = 0;
      Client.prototype.nick = function(){ called++; };
      client = new Client();
      client.on('nick', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/nick colinm\r\n');
    });
    it('should call this.nick()');
  });
  
  describe('on /quit [...]', function(){
    it('should emit "quit"');
    it('should call this.quit()');
  });
  
  describe('on /join [...]', function(){
    it('should emit "join"', function(done){
      var client = new Client();
      var n = 0;
      client.on('join', function(channels){
        switch (n++) {
          case 0:
            channels.should.equal('#express,#node.js');
            break;
          case 1:
            channels.should.equal('#express');
            done();
            break;
        }
      });
      client.parser.line('/join #express,#node.js\r\n');
      client.parser.line('/join #express\r\n');
    });
    it('should call this.join()', function(done){
      var client, called = 0;
      Client.prototype.join = function(){ called++; };
      client = new Client();
      client.on('join', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/join #express\r\n');
    });
  });
  
  describe('on /part [...] message', function(){
    it('should emit "part"', function(done){
      var client = new Client();
      var n = 0;
      client.on('part', function(channels){
        switch (n++) {
          case 0:
            channels.should.equal('#express,#node.js');
            break;
          case 1:
            channels.should.equal('#express');
            break;
          case 2:
            (channels === undefined).should.equal(true);
            done();
            break;
        }
      });
      client.parser.line('/part #express,#node.js\r\n');
      client.parser.line('/part #express\r\n');
      client.parser.line('/part\r\n');
    });
    it('should call this.part()', function(done){
      var client, called = 0;
      Client.prototype.part = function(){ called++; };
      client = new Client();
      client.on('part', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/part #express\r\n');
    });
  });
  
  describe('on /mode [...]', function(){
    it('should emit "mode"');
    it('should call this.mode()');
  });
  
  describe('on /topic [...]', function(){
    it('should emit "topic"', function(done){
      var client = new Client();
      var n = 0;
      client.on('topic', function(channel, topic){
        switch (n++) {
          case 0:
            (channel === undefined).should.equal(true);
            topic.should.equal('New topic');
            break;
          case 1:
            (channel === undefined).should.equal(true);
            topic.should.equal('');
            done();
            break;
        }
      });
      client.parser.line('/topic New topic\r\n');
      client.parser.line('/topic\r\n');
    });
    it('should call this.topic()', function(done){
      var client, called = 0;
      Client.prototype.topic = function(){ called++; };
      client = new Client();
      client.on('topic', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/topic Minimalist design\r\n');
    });
  });

  describe('on /names [...]', function(){
    it('should emit "names"', function(done){
      var client = new Client();
      var n = 0;
      client.on('names', function(channels){
        switch (n++) {
          case 0:
            channels.should.equal('#express,#node.js');
            break;
          case 1:
            (channels === undefined).should.equal(true);
            done();
            break;
        }
      });
      client.parser.line('/names #express,#node.js\r\n');
      client.parser.line('/names\r\n');
    });
    it('should call this.names()', function(done){
      var client, called = 0;
      Client.prototype.names = function(){ called++; };
      client = new Client();
      client.on('names', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/names\r\n');
    });
  });
  
  describe('on /list [...]', function(){
    it('should emit "list"');
    it('should call this.list()');
  });
  
  describe('on /invite [...]', function(){
    it('should emit "invite"');
    it('should call this.invite()');
  });
  
  describe('on /kick [...]', function(){
    it('should emit "kick"');
    it.skip('should call this.kick()', function(done){
      var client, called = 0;
      Client.prototype.kick = function(){ called++; };
      client = new Client();
      client.on('kick', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/kick colinm\r\n');
    });
    it('should call this.kick()');
  });

  
  describe('on [...]', function(){
    it('should emit "send"', function(done){
      var client = new Client();
      client.on('send', function(to, message){
        (to === undefined).should.equal(true);
        message.should.equal('Hello there...');
        done();
      });
      client.parser.line('Hello there...\r\n');
    });
    it('should call this.message()', function(done){
      var client, called = 0;
      Client.prototype.message = function(){ called++; };
      client = new Client();
      client.on('send', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('Hello there...\r\n');
    });
  });
  
  describe('on /msg nick message', function(){
    it('should emit "send"', function(done){
      var client = new Client();
      client.on('send', function(to, message){
        to.should.equal('cmilhench');
        message.should.equal('Hello there...');
        done();
      });
      client.parser.line('/msg cmilhench Hello there...\r\n');
    });
    it('should call this.message()', function(done){
      var client, called = 0;
      Client.prototype.message = function(){ called++; };
      client = new Client();
      client.on('send', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/msg cmilhench Hello there...\r\n');
    });
  });
  
  describe('on /motd [...]', function(){
    it('should emit "motd"');
    it('should call this.motd()');
  });
  
  describe('on /who [...]', function(){
    it('should emit "who"');
    it('should call this.who()');
  });
  
  describe('on /whois [...]', function(){
    it('should emit "whois"');
    it('should call this.whois()');
  });
  
  describe('on /whowas [...]', function(){
    it('should emit "whowas"');
    it('should call this.whowas()');
  });
  
  describe('on /away [...]', function(){
    it('should emit "away"');
    it.skip('should call this.away()', function(done){
      var client, called = 0;
      Client.prototype.away = function(){ called++; };
      client = new Client();
      client.on('away', function(){
        setTimeout(function () {
          called.should.equal(1);
          done(); 
        }, 10);
      });
      client.parser.line('/away out to lunch\r\n');
    });
  });
  
  
});