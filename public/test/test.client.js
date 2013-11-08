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

describe('Client', function(){
  
  describe('on [...]', function(){
    it('should emit "send"', function(done){
      var client = new Client();
      var n = 0;
      client.on('data', function(data){
        data.command.should.equal('');
        data.params.should.equal('');
        data.string.should.equal('Hello there...');
        if (++n === 2) done();
      });
      client.on('send', function(to, message){
        (to === undefined).should.equal(true);
        message.should.equal('Hello there...');
        if (++n === 2) done();
      });
      client.parser.line('Hello there...\r\n');
    });
  });
  
  describe('on /msg nick message', function(){
    it('should emit "send"', function(done){
      var client = new Client();
      var n = 0;
      client.on('data', function(data){
        data.command.should.equal('msg');
        data.params.should.equal('cmilhench Hello there...');
        if (++n === 2) done();
      });
      client.on('send', function(to, message){
        to.should.equal('cmilhench');
        message.should.equal('Hello there...');
        if (++n === 2) done();
      });
      client.parser.line('/msg cmilhench Hello there...\r\n');
    });
  });
  
  describe('on /join [...]', function(){
    it('should emit "join"', function(done){
      var client = new Client();
      var n = 0;
      client.on('join', function(channels){
        switch (n++) {
          case 0:
            channels.should.equal('#express,#node.js');
            // TODO: should have added channels to storage
            break;
          case 1:
            channels.should.equal('#express');
            // TODO: should have added channels to storage
            done();
            break;
        }
      });
      // part multiple channels
      client.parser.line('/join #express,#node.js\r\n');
      // part a single channel
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
            // TODO: should have removed channels from storage
            break;
          case 1:
            channels.should.equal('#express');
            // TODO: should have removed channels from storage
            break;
          case 2:
            (channels === undefined).should.equal(true);
            // TODO: should have removed channels from storage
            done();
            break;
        }
      });
      // part multiple channels
      client.parser.line('/part #express,#node.js\r\n');
      // part a single channel
      client.parser.line('/part #express\r\n');
      // part current channel
      client.parser.line('/part\r\n');
    });
  });
  
  describe.skip('on /nick [...]', function(){
    it('should emit "nick"', function(done){
    });
  });
  
  describe.skip('on /kick [...]', function(){
    it('should emit "kick"', function(done){
    });
  });
  describe.skip('on /away [...]', function(){
    it('should emit "away"', function(done){
    });
  });
  describe.skip('on /topic [...]', function(){
    it('should emit "topic"', function(done){
    });
  });
  describe.skip('on /quit [...]', function(){
    it('should emit "quit"', function(done){
    });
  });
  describe.skip('on /names [...]', function(){
    it('should emit "names"', function(done){
    });
  });
  
});