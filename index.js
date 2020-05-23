var mineflayer = require('mineflayer');
var vec = require('vec3');
const config = require('./config.json');
var tpsPlugin = require('mineflayer-tps')(mineflayer);
var AutoAuth = require('mineflayer-auto-auth');

var bot = mineflayer.createBot({
  plugins: [AutoAuth],
  AutoAuth: config.ingamepassword,
  host: config.host,
  username: config.username,
  port: config.port,
  version: config.MCversion
});

require('./armor-manager')(bot, {
  logging: true,
  version: 1.12
});

bot.loadPlugin(tpsPlugin) // Load the plugin

bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  
  if (message == "|coords") {
	bot.chat("The bot coords are XYZ: " + bot.entity.position.x + " / " + bot.entity.position.y + " / " + bot.entity.position.z );
  };
    
  if (message === '|tps') {
    bot.chat('Current tps: ' + bot.getTps())
  }
  
  return;
});

bot.on('error', err => console.log(err));