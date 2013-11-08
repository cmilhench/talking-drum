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
          msg.command.should.equal('nick');
          msg.params.should.equal('cmilhench');
          break;
        case 1:
          msg.command.should.equal('');
          msg.string.should.equal('Hello world\r\n');
          break;
        case 2:
          msg.command.should.equal('join');
          msg.params.should.equal('#express');
          done();
          break;
      }
    });

    parser.line('/nick cmilhench\r\n');
    parser.line('Hello world\r\n');
    parser.line('/join #express\r\n');
  });
});