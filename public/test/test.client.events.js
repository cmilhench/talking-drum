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
      client.parser.line({string:'/nick colinm\r\n'});
    });
    it('should call this.nick()');
  });
  
  describe('on /quit [...]', function(){
    it('should emit "quit"');
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
      client.parser.line({string:'/join #express,#node.js\r\n'});
      client.parser.line({string:'/join #express\r\n'});
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
      client.parser.line({string:'/part #express,#node.js\r\n'});
      client.parser.line({string:'/part #express\r\n'});
      client.parser.line({string:'/part\r\n'});
    });
  });
  
  describe('on /mode [...]', function(){
    it('should emit "mode"');
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
      client.parser.line({string:'/topic New topic\r\n'});
      client.parser.line({string:'/topic\r\n'});
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
      client.parser.line({string:'/names #express,#node.js\r\n'});
      client.parser.line({string:'/names\r\n'});
    });
  });
  
  describe('on /list [...]', function(){
    it('should emit "list"');
  });
  
  describe('on /invite [...]', function(){
    it('should emit "invite"');
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
      client.parser.line({string:'/kick colinm\r\n'});
    });
  });

  
  describe('on [...]', function(){
    it('should emit "send"', function(done){
      var client = new Client();
      client.on('send', function(to, message){
        (to === undefined).should.equal(true);
        message.should.equal('Hello there...');
        done();
      });
      client.parser.line({string:'Hello there...'});
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
      client.parser.line({string:'Hello there...\r\n'});
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
      client.parser.line({string:'/msg cmilhench Hello there...'});
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
      client.parser.line({string:'/msg cmilhench Hello there...\r\n'});
    });
  });
  
  describe('on /motd [...]', function(){
    it('should emit "motd"');
  });
  
  describe('on /who [...]', function(){
    it('should emit "who"');
  });
  
  describe('on /whois [...]', function(){
    it('should emit "whois"');
  });
  
  describe('on /whowas [...]', function(){
    it('should emit "whowas"');
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
      client.parser.line({string:'/away out to lunch\r\n'});
    });
  });
  
  
});