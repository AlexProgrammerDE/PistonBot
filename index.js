var mineflayer = require('mineflayer');
const config = require('./config.json');
var tpsPlugin = require('mineflayer-tps')(mineflayer);
var Vec3 = require('vec3').Vec3;
const navigatePlugin = require('mineflayer-navigate')(mineflayer);

var bot = mineflayer.createBot({
  host: config.host,
  username: config.username,
  port: config.port,
  version: config.MCversion
});

require('./armor-manager')(bot, {
  logging: true,
  version: 1.12
});

navigatePlugin(bot);
bot.loadPlugin(tpsPlugin);

bot.on('chat', function(username, message) {
  console.log(message);
  
  if (username === bot.username) return;
  
  if (message == '|coords') {
	var pos = Number.parseInt(bot.entity.position.x);
	
	bot.chat("My coords are: " + Number.parseInt(bot.entity.position.x) + " " + Number.parseInt(bot.entity.position.y) + " " + Number.parseInt(bot.entity.position.z));
  }
  
  if (message == '|tps') {
    bot.chat('Current tps: ' + bot.getTps())
  }
  
  if (message === '|come') {
	if (bot.players[username].entity == null) {
		bot.chat(username + " it seems like your out of range.");
	} else {
		const target = bot.players[username].entity;
		bot.chat("Starting following " + username + ".")
		bot.navigate.to(target.position);
	}
  }
  
  if (message === '|stop') {
    bot.navigate.stop();
  }
  
  if (message === '|ping') {
	bot.chat(username + " your ping is: " + bot.players[username].ping);
  }
  
  if (message.startsWith('|goto')) {
	var messages = message.split(" ");
	
	if (messages.length === 4) {
		var targetpos = new Vec3(messages[1], messages[2], messages[3]);
		
		bot.chat("Trying to get to: " + messages[1] + " " + messages[2] + " " + messages[3]);
		
		bot.navigate.to(targetpos);
	} else {
		bot.chat("Sorry you didnt use: |goto x y z");
	}
  }
  
  if (message === '|help') {
	bot.chat("PistonBot help: |tpa, |ping, |goto, |come, |stop, |coords");
  }
  
  if (message.startsWith('|link')) {
	var messages = message.split(" ");
	
	if (messages.length === 2) {
		if (messages[1] === 'test') {
			bot.chat("https://google.com");
		}
	} else {
		bot.chat("Sorry you should use: |link topic");
	}
  }
});

bot.on('spawn', function() {
  bot.chat("/login " + config.ingamepassword);
});

bot.navigate.on('pathFound', function (path) {
  bot.chat("found path. I can get there in " + path.length + " moves.");
});

bot.navigate.on('cannotFind', function (closestPath) {
  bot.chat("unable to find path. getting as close as possible");
  bot.navigate.walk(closestPath);
});

bot.navigate.on('arrived', function () {
  bot.chat("I have arrived");
});

bot.navigate.on('interrupted', function() {
  bot.chat("stopping");
});

bot.on('error', err => console.log(err));