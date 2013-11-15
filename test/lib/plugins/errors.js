
var irc = require('slate-irc');//require('../..');
var Stream = require('stream').PassThrough;

describe('error()', function(){
  describe('on ERROR', function(){
    it('should emit "err"', function(done){
      var stream = new Stream;
      var client = irc(stream);
      
      client.use(require('../../../lib/plugins/errors')());

      client.on('err', function(e){
        e.command.should.eql('ERROR');
        e.message.should.eql([
          'Closing Link: client.host.net (Connection timed out)'
        ].join(''));
        done();
      });
      stream.write([
        'ERROR :',
        'Closing Link: client.host.net (Connection timed out)\r\n'
      ].join(''));
    });
  });

  describe('on ERR_NICKNAMEINUSE', function(){
    it('should emit "err"', function(done){
      var stream = new Stream;
      var client = irc(stream);
      
      client.use(require('../../../lib/plugins/errors')());
      
      client.on('err', function(e){
        e.command.should.eql('ERR_NICKNAMEINUSE');
        e.message.should.eql('Nickname is already in use.');
        e.params.should.be.instanceof(Array).and.have.lengthOf(2);
        e.params.should.include('*');
        e.params.should.include('colinm');
        done();
      });
      stream.write([
        ':irc.host.net 433 * colinm :',
        'Nickname is already in use.\r\n'
      ].join(''));
    });
  });

  describe('on ERR_UNAVAILRESOURCE', function(){
    it('should emit "err"', function(done){
      var stream = new Stream;
      var client = irc(stream);
      
      client.use(require('../../../lib/plugins/errors')());

      client.on('err', function(e){
        e.command.should.eql('ERR_UNAVAILRESOURCE');
        e.message.should.eql('Nick/channel is temporarily unavailable');
        e.params.should.be.instanceof(Array).and.have.lengthOf(2);
        e.params.should.include('*');
        e.params.should.include('colinm');
        done();
      });
      stream.write([
        ':irc.host.net 437 * colinm :',
        'Nick/channel is temporarily unavailable\r\n'
      ].join(''));
    });
  });

});

