var nodemon = require('nodemon')

nodemon({
  script: 'index.js',
  ignore: 'data/*'
})

nodemon.on('start', function () {
  console.log('nodemon started')
}).on('exit', function () {
  console.log('script exited for some reason. Restarting...')
  nodemon.emit('restart')
})
