// Unused code
var nodemon = require('nodemon')

nodemon({
  script: 'index.js',
  ignore: 'data/*',
  args: process.argv.slice(2)
})

nodemon.on('start', function () {
  console.log('nodemon started')
}).on('exit', function () {
  console.log('script exited for some reason. Restarting...')
  nodemon.emit('restart')
}).on('quit', function () {
  console.log('script exited for some reason. Restarting...')
  nodemon.emit('restart')
}).on('crash', function () {
  console.log('script exited for some reason. Restarting...')
  nodemon.emit('restart')
})
