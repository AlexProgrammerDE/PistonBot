var mineflayer = require('mineflayer')
const config = require('./config.json')
var tpsPlugin = require('mineflayer-tps')(mineflayer)
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalFollow } = require('mineflayer-pathfinder').goals
const bible = require('./data/bible')
const commands = require('./data/commands')
const secrets = require('./secrets.json')
const modules = require('./modules.json')
const spam = require('./data/spam')
const foodType = [260, 282, 297, 320, 322, 357, 360, 364, 366, 391, 393, 396, 412, 424]
var isEating = false
const weapons = [276, 283, 267, 272, 268]
var fs = require('fs')
var end
var isWriting
const express = require('express')
const app = express()
var playerjoin
const ud = require('urban-dictionary')

var bot = mineflayer.createBot({
  host: config.host,
  username: secrets.username,
  port: config.port,
  version: config.MCversion
})

require('./armor-manager')(bot, {
  logging: true,
  version: 1.12
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(tpsPlugin)

function text (username, message, whisper) {
  var executed = false
  var prefix

  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)

  console.log(username + ' ' + message + ' (' + whisper + ')')

  if (message.includes('/login')) {
    bot.chat('/login ' + secrets.ingamepassword)
  }

  if (username === undefined) return

  if (username === 'whispers') return

  if (username === 'you') return

  if (username === bot.username) return

  if (whisper) {
    prefix = '/tell ' + username + ' '
  } else {
    prefix = ''
  }

  if (message === '_coords' && modules.coords) {
    bot.chat(prefix + 'My coords are: ' + Number.parseInt(bot.entity.position.x) + ' ' + Number.parseInt(bot.entity.position.y) + ' ' + Number.parseInt(bot.entity.position.z))
    executed = true
  }

  if (message === '_tps' && modules.tps) {
    bot.chat(prefix + 'Current tps: ' + bot.getTps())
    executed = true
  }

  if (modules.navigation && (!whisper)) {
    if (message === '_come') {
      if (bot.players[username] === undefined || bot.players[username].entity == null) {
        bot.chat(username + ' it seems like your out of range.')
      } else {
        const target = bot.players[username].entity
        bot.chat('Going to ' + username + '.')

        const p = target.position

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
      }
      executed = true
    }

    if (message === '_stop') {
      if (bot.players[username] === undefined || bot.players[username].entity == null) {
        bot.chat('Sorry only player which i see are allowed to use this command.')
      } else {
        bot.chat('Stopping...')
        bot.pathfinder.setMovements(null)
        bot.pathfinder.setGoal(null)
        bot.clearControlStates()
      }
      executed = true
    }

    if (message === '_follow') {
      if (bot.players[username] === undefined || bot.players[username].entity == null) {
        bot.chat(username + ' it seems like your out of range.')
      } else {
        const target = bot.players[username].entity
        bot.chat('Starting folowing' + username + '.')
        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalFollow(target, 3), true)
      }
      executed = true
    }

    if (message.startsWith('_goto')) {
      const cmd = message.split(' ')

      if (cmd.length === 4) { // goto x y z
        const x = parseInt(cmd[1], 10)
        const y = parseInt(cmd[2], 10)
        const z = parseInt(cmd[3], 10)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalBlock(x, y, z))
        bot.chat('Going to: x' + x + ' y' + y + ' z' + z)
      } else if (cmd.length === 3) { // goto x z
        const x = parseInt(cmd[1], 10)
        const z = parseInt(cmd[2], 10)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalXZ(x, z))
        bot.chat('Going to: x' + x + ' z' + z)
      } else if (cmd.length === 2) { // goto y
        const y = parseInt(cmd[1], 10)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalY(y))
        bot.chat('Going to: y' + y)
      }
      executed = true
    }
  }

  if (message.startsWith('_ping') && modules.ping) {
    if (message === '_ping') {
      if (bot.players[username]) {
        bot.chat(prefix + username + ' your ping is: ' + bot.players[username].ping)
      } else {
        bot.chat(prefix + 'Sorry i can only ping players.')
      }
    } else {
      var messages = message.split(' ')

      if (messages.length === 2) {
        if (bot.players[messages[1]]) {
          if (messages[1] === username) {
            if (bot.players[username]) {
              bot.chat(prefix + username + ' your ping is: ' + bot.players[username].ping)
            } else {
              bot.chat(prefix + 'Sorry i can only ping players.')
            }
          } else {
            bot.chat(prefix + 'The ping of ' + bot.players[messages[1]].username + ' is: ' + bot.players[messages[1]].ping)
          }
        } else {
          bot.chat(prefix + "Sorry i can't find that player.")
        }
      } else {
        bot.chat(prefix + 'Sorry you didnt use: _ping username')
      }
    }
    executed = true
  }

  if (message === '_help' && modules.help) {
    bot.chat(prefix + 'PistonBot help: _tps, _ping, _coords, _tpa, _tpy, _rules, _report, _bible, _about, _goto, _come, _stop _rm, _lm, _fm, _wm, _urban')
    executed = true
  }

  if (modules.tp) {
    if (message.startsWith('_tpa')) {
      messages = message.split(' ')

      if (messages.length === 2) {
        if (Number.parseInt(bot.entity.position.x) >= 1000 || Number.parseInt(bot.entity.position.x) >= 1000) {
          bot.chat('/tpa ' + messages[1])
        } else {
          bot.chat(prefix + 'Sorry i am not 1000 blocks away from spawn. :(')
        }
      } else {
        bot.chat(prefix + 'Sorry you should use: _tpa username')
      }
      executed = true
    }

    if (message.startsWith('_tpy')) {
      messages = message.split(' ')

      if (messages.length === 2) {
        bot.chat('/tpy ' + messages[1])
      } else {
        bot.chat(prefix + 'Sorry you should use: _tpy username')
      }
      executed = true
    }
  }

  if (message === '_rules' && modules.rules) {
    bot.chat(prefix + "No rules, but pls don't spam, hack, dupe, xray, swear or grief.")
    executed = true
  }

  if (modules.ny && (!whisper)) {
    if (message === '_no') {
      bot.chat('NO!')
      executed = true
    }

    if (message === '_yes') {
      bot.chat('YES!')
      executed = true
    }
  }

  if (message.startsWith('_report') && modules.report) {
    messages = message.split(' ')

    if (messages.length >= 3) {
      bot.chat(prefix + 'Reported ' + messages[1] + ' for ' + message.replace('_report ' + messages[1], ''))
    } else {
      bot.chat(prefix + 'Sorry you should use: _report username reason')
    }
    executed = true
  }

  if (modules.bible) {
    if (message === '_bible' || message === '_verse') {
      bot.chat(prefix + bible.proverbs[Math.round(Math.random() * (bible.proverbs.length - 1))])
      executed = true
    }
  }

  if (message === '_about' && modules.about) {
    bot.chat(prefix + 'PistonBot coded by Pistonmaster with <3!')
    executed = true
  }

  if (message.startsWith('_say') && username === 'Pistonmaster') {
    var say = message.replace('_say ', '')

    bot.chat(say)
    executed = true
  }

  if (message === '_killbot' && username === 'Pistonmaster') {
    bot.chat('/kill')
    executed = true
  }

  if (message === '_wm' && whisper === false) {
    playerjoin = require('./data/playerjoin.json')

    if (Object.keys(playerjoin).includes(username)) {
      console.log('Player is in the database. Reading the state.')
      if (playerjoin[username]) {
        console.log('Messages are true. Setting to false.')
        playerjoin[username] = false
        bot.chat(prefix + 'Deactivated welcome messages. You can toggle them with: _wm')
      } else {
        console.log('Messages are false. Setting to true.')
        playerjoin[username] = true
        bot.chat(prefix + 'Activated welcome messages. You can toggle them with: _wm')
      }
    } else {
      console.log('Player is not in the database. Adding the player and setting it to true.')
      bot.chat(prefix + 'Activated welcome messages. You can toggle them with: _wm')
      playerjoin[username] = true
    }

    isWriting = true

    fs.writeFile('./data/playerjoin.json', JSON.stringify(playerjoin), function (err) {
      if (err) {
        console.log(err)
      }
      console.log('Saved playerjoin.')
      isWriting = false
    })
  }

  if (message.startsWith('_urban ')) {
    var term = message.slice(7)
    ud.term(term, (error, entries, tags, sounds) => {
      if (error) {
        console.error(error.message)
      } else {
        bot.chat(prefix + entries[0].definition)
      }
    })
  }

  if (whisper === false) {
    var playerdata = require('./data/playerdata.json')
    var split = message.split(' ')

    if (message.startsWith('_fm') || message.startsWith('_firstmessage')) {
      if (split.length === 1) {
        if (Object.keys(playerdata).includes(username) && playerdata[username][0] !== undefined) {
          bot.chat(username + ' your first message which i recorded was: ' + playerdata[username][0])
        } else {
          bot.chat(username + ' sorry i didnt record any messages from you.')
        }
      } else if (split.length === 2) {
        if (Object.keys(playerdata).includes(split[1]) && playerdata[split[1]][0] !== undefined) {
          bot.chat(username + ' here is the first message which i recorded from ' + split[1] + ': ' + playerdata[split[1]][0])
        } else {
          bot.chat(username + ' sorry i didnt record any messages from ' + split[1] + '.')
        }
      } else if (split.length > 2) {
        bot.chat('Please use: _fm username or _fm')
      }
      executed = true
    }

    if (message.startsWith('_lm') || message.startsWith('_lastmessage')) {
      if (split.length === 1) {
        if (Object.keys(playerdata).includes(username) && playerdata[username][0] !== undefined) {
          bot.chat(username + ' your last message which i recorded was: ' + playerdata[username][playerdata[username].length - 1])
        } else {
          bot.chat(username + ' sorry i didnt record any messages from you.')
        }
      } else if (split.length === 2) {
        if (Object.keys(playerdata).includes(split[1]) && playerdata[split[1]][0] !== undefined) {
          bot.chat(username + ' here is the last message which i recorded from ' + split[1] + ': ' + playerdata[split[1]][playerdata[split[1]].length - 1])
        } else {
          bot.chat(username + ' sorry i didnt record any messages from ' + split[1] + '.')
        }
      } else if (split.length > 2) {
        bot.chat('Please use: _lm username or _lm')
      }
      executed = true
    }

    if (message.startsWith('_rm') || message.startsWith('_randommessage')) {
      if (split.length === 1) {
        if (Object.keys(playerdata).includes(username) && playerdata[username][0] !== undefined) {
          bot.chat(username + ' here is a random message which i recorded from you: ' + playerdata[username][Math.round(Math.random() * (playerdata[username].length - 1))])
        } else {
          bot.chat(username + ' sorry i didnt record any messages from you.')
        }
      } else if (split.length === 2) {
        if (Object.keys(playerdata).includes(split[1]) && playerdata[split[1]][0] !== undefined) {
          bot.chat(username + ' here is a random message which i recorded from ' + split[1] + ': ' + playerdata[split[1]][Math.round(Math.random() * (playerdata[split[1]].length - 1))])
        } else {
          bot.chat(username + ' sorry i didnt record any messages from ' + split[1] + '.')
        }
      } else if (split.length > 2) {
        bot.chat('Please use: _rm username or _rm')
      }

      executed = true
    }

    if (message === '_phrases' && username === 'Pistonmaster') {
      bot.chat('Calculating amount of ALL saved phrases.')

      playerdata = require('./data/playerdata.json')
      var amount1 = 0

      for (var player1 in playerdata) {
        amount1 = amount1 + playerdata[player1].length
      }

      setTimeout(() => bot.chat('Amount of ALL phrases: ' + amount1), 2000)
    }

    if (message === '_words' && username === 'Pistonmaster') {
      bot.chat('Calculating amount of ALL saved words.')

      playerdata = require('./data/playerdata.json')
      var amount2 = 0

      for (var player2 in playerdata) {
        for (var phraseindex in playerdata[player2]) {
          var phrasetext = playerdata[player2][phraseindex]
          var phrasesplit = phrasetext.split(' ')
          amount2 = amount2 + phrasesplit.length
        }
      }

      setTimeout(() => bot.chat('Amount of ALL words: ' + amount2), 2000)
    }

    if (executed === false) {
      if (Object.keys(playerdata).includes(username)) {
        console.log('Player is in the database. Adding the message.')
        playerdata[username].push(message)
      } else {
        console.log('Player is not in the database. Adding the player and the message to the database.')
        playerdata[username] = [message]
      }

      isWriting = true
      fs.writeFile('./data/playerdata.json', JSON.stringify(playerdata), function (err) {
        if (err) {
          console.log(err)
        }
        console.log('Saved playerdata.')
        isWriting = false
      })
    }
  }
}

bot.on('chat', function (username, message) {
  text(username, message, false)
})

bot.on('whisper', function (username, message, a, jsonMsg) {
  text(username, message, true)
})

if (modules.web) {
  app.use('/', (req, res) => {
    var playerdata = require('./data/playerdata.json')

    res.send(JSON.stringify(playerdata))
  })

  app.listen(80)
}

bot.on('login', function () {
  bot.chat('/login ' + secrets.ingamepassword)

  console.log('I spawned and set everything up.')
})

if (modules.spam) {
  setInterval(() => {
    bot.chat(spam.txt[Math.round(Math.random() * (spam.txt.length - 1))])
  }, 30000)
}

if (modules.bchelp) {
  setInterval(() => {
    bot.chat(commands.bc[Math.round(Math.random() * (commands.bc.length - 1))])
  }, 120000)
}

bot.on('kicked', function (reason) {
  console.log('I got kicked for ' + reason)

  end = true
})

bot.on('end', function (reason) {
  console.log('I end now: ' + reason)

  end = true
})

bot.on('playerJoined', function (player) {
  playerjoin = require('./data/playerjoin.json')
  if (playerjoin[player.username]) {
    bot.chat('> Welcome ' + player.username + ' to this server!')
  }
})

setInterval(() => {
  if (end && !isWriting) {
    process.exit(0)
  }
}, 100)

bot.on('path_update', (results) => {
  console.log('I can get there in ' + results.path.length + ' moves. Computation took ' + results.time.toFixed(2) + ' ms.')
})

setInterval(() => {
  if (modules.eat) {
    if (isEating === false && (bot.food !== 20)) {
      var food = checkFood(bot.inventory)

      if (food) {
        bot.equip(food, 'hand')
        isEating = true
        bot.consume(function () { isEating = false })
      }
    }
  }

  if (isEating === false && modules.attack) {
    var weapon = checkWeapon(bot.inventory)

    if (weapon) {
      console.log(weapon)
      bot.equip(weapon, 'hand')
    }
  }

  var entity = nearestEntity()
  if (entity) {
    if (entity.type === 'player') {
      bot.lookAt(entity.position.offset(0, 1, 0))
    } else if (entity.type === 'mob') {
      bot.lookAt(entity.position)
    }

    if (entity.type === 'mob' && entity.kind === 'Hostile mobs' && modules.attack) {
      bot.attack(entity)
    }
  }

  if (modules.totem) {
    var totem = bot.inventory.findInventoryItem(449, null)
    if (totem && totem.type === 449) {
      bot.equip(totem, 'off-hand')
    }
  }
}, 25)

bot.on('error', err => console.log(err))

function nearestEntity (type) {
  var id, entity, dist
  var best = null
  var bestDistance = null
  for (id in bot.entities) {
    entity = bot.entities[id]
    if (type && entity.type !== type) continue
    if (entity === bot.entity) continue
    dist = bot.entity.position.distanceTo(entity.position)
    if (!best || dist < bestDistance) {
      best = entity
      bestDistance = dist
    }
  }
  return best
}

function checkFood (window) {
  var food = null

  window.items().forEach(Item => {
    if (foodType.includes(Item.type)) {
      food = Item
    }
  })

  return food
}

function checkWeapon (window) {
  var index = weapons.length
  var weapon = null

  window.items().forEach(Item => {
    if (weapons.includes(Item.type)) {
      if (weapons.indexOf(Item.type) < index) {
        index = weapons.indexOf(Item.type)

        weapon = Item
      }
    }
  })

  return weapon
}
