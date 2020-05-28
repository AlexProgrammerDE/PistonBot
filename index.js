var mineflayer = require('mineflayer');
const config = require('./config.json');
var tpsPlugin = require('mineflayer-tps')(mineflayer);
var Vec3 = require('vec3').Vec3;
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
const bible = require('./data/bible');
const commands = require('./data/commands');
const secrets = require('./secrets.json');
const modules = require('./modules.json');
const spam = require('./data/spam');

var bot = mineflayer.createBot({
  host: config.host,
  username: secrets.username,
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
  console.log(username + " " + message);
  
  if (username === undefined) return;
  
  if (username === bot.username) return;
  
  if (message === '_coords' && modules.coords) {
	var pos = Number.parseInt(bot.entity.position.x);
	
	bot.chat("My coords are: " + Number.parseInt(bot.entity.position.x) + " " + Number.parseInt(bot.entity.position.y) + " " + Number.parseInt(bot.entity.position.z));
  }
  
  if (message === '_tps' && modules.tps) {
    bot.chat('Current tps: ' + bot.getTps())
  }
  
  if (modules.navigation) {
  if (message === '_come') {
	if (bot.players[username].entity == null) {
		bot.chat(username + " it seems like your out of range.");
	} else {
		const target = bot.players[username].entity;
		bot.chat("Starting following " + username + ".")
		bot.navigate.to(target.position);
	}
  }
  
  if (message === '_stop') {
    bot.navigate.stop();
  }
  
  if (message.startsWith('_goto')) {
	var messages = message.split(" ");
	
	if (messages.length === 4) {
		var targetpos = new Vec3(messages[1], messages[2], messages[3]);
		
		bot.chat("Trying to get to: " + messages[1] + " " + messages[2] + " " + messages[3]);
		
		bot.navigate.to(targetpos);
	} else {
		bot.chat("Sorry you didnt use: _goto x y z");
	}
  }
  }
  
  if (message.startsWith('_ping') && modules.ping) {
	if (message === '_ping') {
	  if (bot.players[username]) {
	    bot.chat(username + " your ping is: " + bot.players[username].ping);
	  } else {
		bot.chat("Sorry i can only ping players.");  
	  }
    } else {
	  var messages = message.split(" ");
	  
	  if (messages.length === 2) {
	  	if (bot.players[messages[1]]) {
	      if (messages[1] === username) {
		    if (bot.players[username]) {
	           bot.chat(username + " your ping is: " + bot.players[username].ping);
	        } else {
			  bot.chat("Sorry i can only ping players.");    
			}
		  } else {
		   	bot.chat("The ping of " + bot.players[messages[1]].username + " is: " + bot.players[messages[1]].ping);
		  }
		} else {
	      bot.chat("Sorry i can't find that player.");  
		}
		
	  } else {
		bot.chat("Sorry you didnt use: _ping username")  
	  }
	}
  }
  
  if (message === '_help' && modules.help) {
	bot.chat("PistonBot help: _tps, _ping, _goto, _come, _stop, _coords, _tpa, _tpy, _rules, _report, _bible, _about");
  }
  
  if (modules.tpa) {
  if (message.startsWith('_tpa')) {
    var messages = message.split(" ");
	
	if (messages.length === 2) {
		bot.chat("/tpa " + messages[1]);
	} else {
		bot.chat("Sorry you should use: _tpa username");
	}
  }
  
  if (message.startsWith('_tpy')) {
    var messages = message.split(" ");
	
	if (messages.length === 2) {
		bot.chat("/tpy " + messages[1]);
	} else {
		bot.chat("Sorry you should use: _tpy username");
	}
  }
  }
  
  if (message === '_rules' && modules.rules) {
    bot.chat("No rules, but pls don't spam, hack, dupe, xray, swear or grief.");
  }
  
  if (modules.ny) {
  if (message === '_no') {
    bot.chat("NO!");
  }
  
  if (message === '_yes') {
    bot.chat("YES!");
  }
  }
  
  if (message.startsWith('_report') && modules.report) {
    var messages = message.split(" ");
	
	if (messages.length >= 3) {
		bot.chat("Reported " + messages[1] + " for " + message.replace("_report " + messages[1], ""));
	} else {
		bot.chat("Sorry you should use: _report username reason");
	}
  }
  
  if (modules.bible) {
  if (message === '_bible' || message === '_verse') {
    bot.chat(bible.proverbs[Math.round(Math.random() * (bible.proverbs.length - 1))]);
  }
  }
  
  if (message === '_about' && modules.about) {
    bot.chat("PistonBot coded by Pistonmaster with <3!");
  }
  
  if (message.startsWith('_say') && username === 'Pistonmaster') {
	var say = message.replace("_say ", "");
	
	bot.chat(say);
  }
  
  if (message === '_killbot' && username === 'Pistonmaster') {	
	bot.chat("/kill");
  }
});

bot.on('login', function() {
  bot.chat("/login " + secrets.ingamepassword);
  
  console.log("I spawned and set everything up.");
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

if (modules.spam) {
  let spambc = setInterval(() => {
  bot.chat(spam.txt[Math.round(Math.random() * (spam.txt.length - 1))]);
  }, 30000)	
}

if (modules.bchelp) {
let helpbc = setInterval(() => {
  bot.chat(commands.bc[Math.round(Math.random() * (commands.bc.length - 1))]);
  
}, 120000)
}

bot.on('kicked', function(reason) {
  console.log("I got kicked for " + reason);
});

bot.on('time', function() {
  /* if (bot.food != 20) {
	
  }
  bot.consume(err => console.log(err)) */
	
  var entity = nearestEntity();
  if(entity) {
	if (entity.type === 'player') {
      bot.lookAt(entity.position.offset(0, 1, 0));
	} else if (entity.type === 'mob') {
	  bot.lookAt(entity.position);
	}
  }
});

bot.on('error', err => console.log(err));

function nearestEntity(type) {
  var id, entity, dist;
  var best = null;
  var bestDistance = null;
  for(id in bot.entities) {
    entity = bot.entities[id];
    if(type && entity.type !== type) continue;
    if(entity === bot.entity) continue;
    dist = bot.entity.position.distanceTo(entity.position);
    if(!best || dist < bestDistance) {
      best = entity;
      bestDistance = dist;
    }
  }
  return best;
}