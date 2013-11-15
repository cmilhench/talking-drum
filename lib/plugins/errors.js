
/**
 * Module dependencies.
 */



/**
 * ERROR plugin emitting "error"
 *
 * @return {Function}
 * @api public
 */

module.exports = function(){
  return function(irc){
    irc.on('data', function(msg){
      if ('ERROR' !== msg.command && msg.command.indexOf('ERR_') !== 0) return;
      var params = msg.params.split(' ');
      var e = {};
      e.command = msg.command;
      e.message = msg.trailing;
      e.params = params;
      irc.emit('err', e);
    });
  };
};
