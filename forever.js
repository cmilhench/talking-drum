var cluster = require('cluster');

if (cluster.isMaster) {
  
  cluster.fork();
  
  cluster.on('disconnect', function() {
    cluster.fork();
  });

} else {
  var domain = require('domain');
  var d = domain.create();
  d.on('error', function(err) {
    console.error('error', err.stack);
    
    try {
      // make sure we close down within 30 seconds
      var killtimer = setTimeout(function() { process.exit(1); }, 30000);
    
      // But don't keep the process open just for that!
      killtimer.unref();
      
      cluster.worker.disconnect();
      
    } catch (e) {
      console.error('error', e.stack);
    }
            
  });
  d.run(function() {
    require('./app');
  });
}