var mineflayer = require('mineflayer');
const config = require('./config.json'); // read the config

var bot = mineflayer.createBot({
  host: "localhost",
  port: 25566,       
  username: "Username",
  password: "password",
  version: "1.12"
});

bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  
  if (message == "|coords") {
	bot.chat("The bot coords are: " + bot.entity.position);
  };
    
  return;
});

bot.on('error', err => console.log(err))