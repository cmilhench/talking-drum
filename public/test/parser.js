// -----------------------------------------------------------------
//  test.parser.js
//  
//  talking-drum
//  Copyright 2013. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

/* jshint -W117 */

var Parser = window.Parser;

describe('Parser', function(){
  it('should emit "message" events', function(done){
    var parser = new Parser();
    var n = 0;

    parser.on('message', function(msg){
      switch (n++) {
        case 0:
          msg.command.should.equal('');
          msg.string.should.equal('Hello world\r\n');
          break;
        case 1:
          msg.command.should.equal('nick');
          msg.params.should.be.instanceof(Array).and.have.lengthOf(1);
          msg.params.should.include('cmilhench');
          break;
        case 2:
          msg.command.should.equal('join');
          msg.params.should.be.instanceof(Array).and.have.lengthOf(1);
          msg.params.should.include('#express');
          break;
        case 3:
          msg.command.should.equal('msg');
          msg.params.should.be.instanceof(Array).and.have.lengthOf(3);
          msg.params.should.include('colinm');
          msg.params.should.include('Hello');
          msg.params.should.include('there...');
          done();
          break;
      }
    });

    parser.line({ string:'Hello world\r\n'});
    parser.line({ string:'/nick cmilhench\r\n'});
    parser.line({ string:'/join #express\r\n'});
    parser.line({ string:'/msg colinm Hello there...\r\n'});
  });
});