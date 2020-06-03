var nodemon = require('nodemon');

nodemon({ script: './index.js' }).on('start', function () {
  console.log('nodemon started');
}).on('crash', function () {
  console.log('script crashed for some reason. Restarting...');
  nodemon.emit('restart');
}).on('exit', function () {
  console.log('script exited for some reason. Restarting...');
  nodemon.emit('restart');
});
