import MinecraftData from 'minecraft-data'
import { Bot, createBot } from 'mineflayer'
import { Entity, EntityType } from 'prismarine-entity'
import { Window } from 'prismarine-windows'
import { Item as PrismarineItem } from 'prismarine-item'
import {Movements, pathfinder, Pathfinder} from 'mineflayer-pathfinder'
import { Channel, Client, MessageEmbed, TextChannel } from 'discord.js'
import { NewPingResult } from 'minecraft-protocol'

const inventoryViewer = require('mineflayer-web-inventory')
const tpsPlugin = require('mineflayer-tps')(require('mineflayer'))
const armorManager = require('mineflayer-armor-manager')
const mc = require('minecraft-protocol')
const autoEat = require('mineflayer-auto-eat')
const viewer = require('prismarine-viewer').mineflayer
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalFollow } = require('mineflayer-pathfinder').goals

import express from 'express'
const pretty = require('express-prettify')
import fs from 'fs'
const ud = require('urban-dictionary')
import Discord from 'discord.js'

import helmet from "helmet";

import commands from "./data/commands";
import bible from "./data/bible";
import spam from "./data/spam";

const client: Client = new Discord.Client({ disableMentions: 'all' })
const app = express()
const server: string = process.argv[2]

const secretsFile = require('./secrets.json')
const serverSecrets = secretsFile[server]
const modules = require('./modules.json')[server]
const config = require('./config.json')[server]

const discordConfig = require('./discord.json')

let isEating = false
let end = false

const time: number = 10

const bot: PistonBot = <PistonBot>createBot({
  host: config.host,
  username: secretsFile.email,
  password: secretsFile.password,
  port: config.port,
  version: config.MCversion,
  checkTimeoutInterval: 300 * 1000
})

const parseJSON = require('minecraft-protocol-chat-parser')(bot.protocolVersion).parseJSON

const mcData: MinecraftData.IndexedData = require('minecraft-data')(bot.version)

const weapons: number[] = [
  mcData.itemsByName.diamond_sword.id,
  mcData.itemsByName.golden_sword.id,
  mcData.itemsByName.iron_sword.id,
  mcData.itemsByName.stone_sword.id,
  mcData.itemsByName.wooden_sword.id
]

bot.loadPlugin(pathfinder)
bot.loadPlugin(tpsPlugin)
bot.loadPlugin(armorManager)
bot.loadPlugin(autoEat)

bot.on('spawn', function () {
  fs.writeFile('./time.txt', time.toString(), function (err: any) {
    if (err) {
      console.log(err)
    }
  })

  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 14,
    bannedFood: []
  }

  if (serverSecrets.ingamepassword !== undefined) {
    bot.chat('/login ' + serverSecrets.ingamepassword)
  }
})

function text (username: string, message: string, whisper: boolean) {
  fs.writeFile('./time.txt', time.toString(), function (err: any) {
    if (err) {
      console.log(err)
    }
  })

  let playerJoin = require('./data/playerjoin.json')
  let playerData: any = require('./data/playerdata.json')
  const prefix: string = whisper ? '/tell ' + username + ' ' : ''
  const args: string[] = message.split(' ').slice(1)

  const defaultMove = new Movements(bot, mcData)

  console.log(username + ' ' + message + ' (' + whisper + ')')

  if (message.includes('/login')) {
    bot.chat('/login ' + serverSecrets.ingamepassword)
  }

  if (username === undefined) return

  if (username === 'whispers') return

  if (username === 'you') return

  if (username === 'queue') return

  if (username === bot.username) return

  const channel: Channel | undefined = client.channels.cache.get(config.bridge)
  if (channel !== undefined && !whisper) {
    const embed: MessageEmbed = new Discord.MessageEmbed()
      .setColor('#C970D9')
      .setURL(discordConfig.website)
      .addField(username.replace('@', '(at)'), message.replace('@', '(at)'), true)
      .setTimestamp()
      .setFooter('PistonBot made by Pistonmaster', 'https://avatars0.githubusercontent.com/u/40795980?s=460&v=4')
    if (channel instanceof TextChannel) {
      channel.send(embed)
    }
  }

  // ONLY COMMAND
  if (message.startsWith('_hi') && modules.hi) {
    bot.chat('Hi ' + username + '! Nice to meet you! <3')
  }

  if (message.startsWith('_coords') && modules.coords) {
    bot.chat(prefix + 'My coords are: ' + Number.parseInt(String(bot.entity.position.x)) + ' ' + Number.parseInt(String(bot.entity.position.y)) + ' ' + Number.parseInt(String(bot.entity.position.z)))
  }

  if (message.startsWith('_tps') && modules.tps) {
    bot.chat(prefix + 'Current tps: ' + bot.getTps())
  }

  if ((message.startsWith('_bible') || message.startsWith('_verse')) && modules.bible) {
    bot.chat(prefix + bible.proverbs[Math.round(Math.random() * (bible.proverbs.length - 1))])
  }

  if (message.startsWith('_about') && modules.about) {
    bot.chat(prefix + 'PistonBot coded by Pistonmaster with <3!')
  }

  if (message.startsWith('_rules') && modules.rules) {
    bot.chat(prefix + "Fuck off!")
  }

  if (message.startsWith('_no')) {
    bot.chat(prefix + 'NO!')
  }

  if (message.startsWith('_yes')) {
    bot.chat(prefix + 'YES!')
  }

  if (message.startsWith('_help')) {
    bot.chat('/tell ' + username + ' PistonBot help: _tps, _ping, _coords, _tpa, _tpy, _rules, _report, _bible, _about, _goto, _come, _stop, _rm, _lm, _fm, _wm, _urban, _discord')
  }

  if (message.startsWith('_discord')) {
    bot.chat('/tell ' + username + ' https://discord.gg/zBPKyC5')
  }

  if (message.startsWith('_tpa') && modules.tp) {
    if (args.length === 1) {
      if ((bot.entity.position.x >= 1000 || bot.entity.position.x <= -1000) || (bot.entity.position.z >= 1000 || bot.entity.position.z <= -1000)) {
        bot.chat('/tpa ' + args[0])
      } else {
        bot.chat(prefix + 'Sorry i am not 1000 blocks away from spawn. :(')
      }
    } else {
      bot.chat(prefix + 'Sorry you should use: _tpa username')
    }
  }

  if (message.startsWith('_tpy') && modules.tp) {
    if (args.length === 1) {
      bot.chat('/tpy ' + args[0])
    } else {
      bot.chat(prefix + 'Sorry you should use: _tpy username')
    }
  }

  if (message.startsWith('_report') && modules.report) {
    if (args.length >= 2) {
      bot.chat(prefix + 'Reported ' + args[0] + ' for ' + message.replace('_report ' + args[0], ''))
    } else {
      bot.chat(prefix + 'Sorry you should use: _report username reason')
    }
  }

  if (modules.navigation && !whisper) {
    if (message.startsWith('_stop')) {
      if (bot.players[username] === undefined || bot.players[username].entity == null) {
        bot.chat('Sorry only player which i see are allowed to use this command')
      } else {
        bot.chat('Stopping')
        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalBlock(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z))
        bot.clearControlStates()
      }
    }

    if (message.startsWith('_follow')) {
      if (bot.players[username] === undefined || bot.players[username].entity == null) {
        bot.chat(username + ' it seems like your out of range')
      } else {
        const target = bot.players[username].entity
        bot.chat('Starting to follow ' + username + '')
        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalFollow(target, 3), true)
      }
    }

    if (message.startsWith('_goto')) {
      const cmd = message.split(' ')

      if (cmd.length === 4) { // goto x y z
        const x = parseInt(cmd[1], 10)
        const y = parseInt(cmd[2], 10)
        const z = parseInt(cmd[3], 10)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalBlock(x, y, z))
        bot.chat('Going to x' + x + ' y' + y + ' z' + z)
      } else if (cmd.length === 3) { // goto x z
        const x = parseInt(cmd[1], 10)
        const z = parseInt(cmd[2], 10)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalXZ(x, z))
        bot.chat('Going to x' + x + ' z' + z)
      } else if (cmd.length === 2) { // goto y
        const y = parseInt(cmd[1], 10)

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalY(y))
        bot.chat('Going to y' + y)
      }
    }
  }

  if (message.startsWith('_ping') && modules.ping) {
    if (args.length === 0) {
      if (bot.players[username]) {
        bot.chat(prefix + username + ' your ping is: ' + bot.players[username].ping)
      } else {
        bot.chat(prefix + 'Sorry i can only ping players')
      }
    } else if (args.length >= 1) {
      if (bot.players[args[0]]) {
        if (args[0] === username) {
          if (bot.players[username]) {
            bot.chat(prefix + username + ' your ping is: ' + bot.players[username].ping)
          } else {
            bot.chat(prefix + 'Sorry i can only ping players')
          }
        } else {
          bot.chat(prefix + 'The ping of ' + bot.players[args[0]].username + ' is: ' + bot.players[args[0]].ping)
        }
      } else {
        if (bot.players[username]) {
          bot.chat(prefix + username + ' your ping is: ' + bot.players[username].ping)
        } else {
          bot.chat(prefix + 'Sorry i can only ping players')
        }
      }
    }
  }

  // PRIVATE COMMANDS
  if (username === 'Pistonmaster') {
    if (message.startsWith('_say')) {
      bot.chat(message.replace('_say ', ''))
    }

    if (message.startsWith('_killbot')) {
      bot.chat('/kill')
    }
  }

  if (message.startsWith('_urban ')) {
    const term = message.slice(7)
    ud.term(term, (error: { message: string }, entries: Array<{ definition: string }>) => {
      if (error) {
        console.error(error.message)
      } else {
        let urbanAnswer = entries[0].definition

        urbanAnswer = urbanAnswer.replace(/(\r\n|\r|\n)/g, '').substr(0, 200)
        console.log(urbanAnswer)

        bot.chat('/tell ' + username + ' ' + urbanAnswer)
      }
    })
  }

  if (message.startsWith('_wm')) {
    playerJoin = require('./data/playerjoin.json')

    if (Object.keys(playerJoin).includes(username)) {
      console.log('Player is in the database. Reading the state.')
      if (playerJoin[username]) {
        playerJoin[username] = false
        bot.chat(prefix + 'Deactivated welcome message. You can toggle them with: _wm')
      } else {
        playerJoin[username] = true
        bot.chat(prefix + 'Activated welcome message. You can toggle them with: _wm')
      }
    } else {
      console.log('Player is not in the database. Adding the player and setting it to true.')
      bot.chat(prefix + 'Activated welcome message. You can toggle them with: _wm')
      playerJoin[username] = true
    }

    fs.writeFileSync('./data/playerjoin.json', JSON.stringify(playerJoin, null, 4))
  }

  if (message.startsWith('_fm') || message.startsWith('_firstmessage')) {
    if (args.length === 0) {
      if (Object.keys(playerData).includes(username) && playerData[username][0] !== undefined) {
        bot.chat(prefix + username + ' your first message which i recorded was: ' + playerData[username][0])
      } else {
        bot.chat(prefix + username + ' sorry i didnt record any messages from you.')
      }
    } else if (args.length === 1) {
      if (Object.keys(playerData).includes(args[0]) && playerData[args[0]][0] !== undefined) {
        bot.chat(prefix + username + ' here is the first message which i recorded from ' + args[0] + ': ' + playerData[args[0]][0])
      } else {
        bot.chat(prefix + username + ' sorry i didnt record any messages from ' + args[0] + '.')
      }
    } else if (args.length > 1) {
      bot.chat(prefix + 'Please use: _fm username or _fm')
    }
  }

  if (message.startsWith('_lm') || message.startsWith('_lastmessage')) {
    if (args.length === 0) {
      if (Object.keys(playerData).includes(username) && playerData[username][0] !== undefined) {
        bot.chat(prefix + username + ' your last message which i recorded was: ' + playerData[username][playerData[username].length - 1])
      } else {
        bot.chat(prefix + username + ' sorry i didnt record any messages from you.')
      }
    } else if (args.length === 1) {
      if (Object.keys(playerData).includes(args[0]) && playerData[args[0]][0] !== undefined) {
        bot.chat(prefix + username + ' here is the last message which i recorded from ' + args[0] + ': ' + playerData[args[0]][playerData[args[0]].length - 1])
      } else {
        bot.chat(prefix + username + ' sorry i didnt record any messages from ' + args[0] + '.')
      }
    } else if (args.length > 1) {
      bot.chat(prefix + 'Please use: _lm username or _lm')
    }
  }

  if (message.startsWith('_rm') || message.startsWith('_randommessage')) {
    if (args.length === 0) {
      if (Object.keys(playerData).includes(username) && playerData[username][0] !== undefined) {
        bot.chat(prefix + username + ' here is a random message which i recorded from you: ' + playerData[username][Math.round(Math.random() * (playerData[username].length - 1))])
      } else {
        bot.chat(prefix + username + ' sorry i didnt record any messages from you.')
      }
    } else if (args.length === 1) {
      if (Object.keys(playerData).includes(args[0]) && playerData[args[0]][0] !== undefined) {
        bot.chat(prefix + username + ' here is a random message which i recorded from ' + args[0] + ': ' + playerData[args[0]][Math.round(Math.random() * (playerData[args[0]].length - 1))])
      } else {
        bot.chat(prefix + username + ' sorry i didnt record any messages from ' + args[0] + '.')
      }
    } else if (args.length > 1) {
      bot.chat(prefix + 'Please use: _rm username or _rm')
    }
  }

  if (message.startsWith('_phrases') && username === 'Pistonmaster') {
    playerData = require('./data/playerdata.json')

    bot.chat(prefix + 'Calculating amount of all saved phrases.')
    let amount1 = 0

    for (const player1 in playerData) {
      amount1 = amount1 + playerData[player1].length
    }

    setTimeout(() => bot.chat(prefix + 'Amount of ALL phrases: ' + amount1), 2000)
  }

  if (message.startsWith('_words') && username === 'Pistonmaster') {
    playerData = require('./data/playerdata.json')

    bot.chat(prefix + 'Calculating amount of all saved words.')
    let amount2 = 0

    for (const player in playerData) {
      for (const phraseIndex in playerData[player]) {
        const phraseText = playerData[player][phraseIndex]
        const phraseSplit = phraseText.split(' ')
        amount2 = amount2 + phraseSplit.length
      }
    }

    setTimeout(() => bot.chat(prefix + 'Amount of ALL words: ' + amount2), 2000)
  }

  if (!whisper && !message.startsWith('_')) {
    if (Object.keys(playerData).includes(username)) {
      if (playerData[username].includes(message)) {
        console.log('That message is already in the database. Not adding it.')
      } else {
        console.log('Player is in the database. Adding the message.')
        playerData[username].push(message)
      }
    } else {
      console.log('Player is not in the database. Adding the player and the message to the database.')
      playerData[username] = [message]
    }

    fs.writeFileSync('./data/playerdata.json', JSON.stringify(playerData, null, 4))
  }
}

bot.on('chat', function (username, message) {
  text(username, message, false)
})

bot.on('whisper', function (username, message, a, jsonMsg) {
  text(username, message, true)
})

if (modules.web.activated) {
  app.use(helmet())
  app.use(pretty({ query: 'pretty' }))

  app.use('/', (req: any, res: { json: (arg0: any) => void }) => {
    res.json(require('./data/playerdata.json'))
  })

  app.listen(modules.web.port)
}

bot.on('login', function () {
  bot.chat('/login ' + serverSecrets.ingamepassword)

  console.log('I spawned and set everything up.')
})

bot.once('spawn', () => {
  if (modules.inventory.activated) {
    inventoryViewer(bot, { port: modules.inventory.port })
  }

  if (modules.viewer.activated) {
    viewer(bot, { port: modules.viewer.port })
    // Draw the path followed by the bot
    const path = [bot.entity.position.clone()]
    bot.on('move', () => {
      if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
        path.push(bot.entity.position.clone())
        bot.viewer.drawLine('path', path)
      }
    })
  }

  setInterval(() => {
    if (!isEating && modules.attack) {
      const weapon = checkWeapon(bot.inventory)

      if (weapon != null) {
        bot.equip(weapon, 'hand', (err) => {
          if (err != null) {
            console.log(err)
          }
        })
      }
    }

    const entity = nearestEntity(null)
    if (entity != null) {
      if (entity.type === 'player') {
        bot.lookAt(entity.position.offset(0, 1, 0))
      } else if (entity.type === 'mob') {
        bot.lookAt(entity.position)
      }

      if (entity.type === 'mob' && entity.kind === 'Hostile mobs' && modules.attack) {
        bot.attack(entity)
      }
    }
  }, 100)

  setInterval(() => {
    if (modules.totem) {
      const totem: PrismarineItem | null = bot.inventory.findInventoryItem(mcData.itemsByName.totem_of_undying.id, null, false)
      let isTotemInOffHand = false

      if (bot.inventory.slots[45] !== null && bot.inventory.slots[45] !== undefined && bot.inventory.slots[45].type === mcData.itemsByName.totem_of_undying.id) {
        isTotemInOffHand = true
      }

      if (totem !== null && totem.slot !== 45 && !isTotemInOffHand) {
        bot.equip(totem, 'off-hand', (err) => {
          if (err != null) {
            console.log(err)
          }
        })
      }
    }
  }, 300)
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

setInterval(() => {
  if (end) {
    console.log('Ending ...')
    process.exit(0)
  }
}, 1000)

bot.on('kicked', function (reason) {
  console.log('I got kicked for ' + reason)

  end = true
})

bot.on('end', () => {
  console.log('I end now.')

  end = true
})

bot.on('error', () => {
})

bot.on('playerJoined', function (player) {
  if (require('./data/playerjoin.json')[player.username]) {
    bot.chat('> Welcome ' + player.username + ' to this server!')
  }
})

// @ts-expect-error
bot.on('path_update', (results) => {
  // console.log('I can get there in ' + results.path.length + ' moves. Computation took ' + results.time.toFixed(2) + ' ms.')
})

// @ts-expect-error
bot.on('autoeat_started', () => {
  console.log('Auto Eat started!')
  isEating = true
})

// @ts-expect-error
bot.on('autoeat_stopped', () => {
  console.log('Auto Eat stopped!')
  isEating = false
})

bot.on('health', () => {
  if (bot.food === 20) bot.autoEat.disable()
  // Disable the plugin if the bot is at 20 food points
  else bot.autoEat.enable() // Else enable the plugin again
})

function nearestEntity (type: EntityType | null): Entity | null {
  let best: Entity | null = null
  let bestDistance: number | null = null

  for (const id in bot.entities) {
    const entity: Entity = bot.entities[id]
    if (type && entity.type !== type) continue
    if (entity === bot.entity) continue
    const dist: number = bot.entity.position.distanceTo(entity.position)

    if ((best == null) || (bestDistance == null || dist < bestDistance)) {
      best = entity
      bestDistance = dist
    }
  }

  return best
}

function checkWeapon (window: Window): PrismarineItem | null {
  let index: number = weapons.length
  let weapon: PrismarineItem | null = null

  window.items().forEach(item => {
    if (weapons.includes(item.type)) {
      if (weapons.indexOf(item.type) < index) {
        index = weapons.indexOf(item.type)

        weapon = item
      }
    }
  })

  return weapon
}

client.on('ready', () => {
  if (client.user === null) {
    return
  }

  console.log(`Logged in as ${client.user.tag}!`)

  client.user.setPresence({
    status: 'online',
    activity: {
      type: 'PLAYING',
      url: discordConfig.website,
      name: discordConfig.status
    }
  })
})

client.on('message', msg => {
  if (msg.member !== null && msg.member.user !== client.user) {
    if (msg.channel.id !== config.bridge) {
      // Commands that should only be triggered once!
      if (discordConfig.primaryserver === server) {
        if (msg.content.startsWith('_help')) {
          msg.reply('PistonBot Discord help:  `_help, _discord, _invite, _info <server>, _playercount <server>, _players <server>, _tps <server>, _servers`')
        } else if (msg.content.startsWith('_discord')) {
          msg.reply('PistonBot Discord: https://discord.gg/9hNWscq')
        } else if (msg.content.startsWith('_invite')) {
          msg.reply('Add PistonBot to YOUR discord server: https://bit.ly/33nSkz1')
        } else if (msg.content.startsWith('_dservercount')) {
          msg.reply('PistonBot is on ' + client.guilds.cache.size + ' servers.')
        }
      }

      if (msg.content.startsWith('_playercount ' + server)) {
        let playerCount = 0

        for (const count in bot.players) {
          if (count) {
            playerCount++
          }
        }

        msg.reply(server + '\'s playercount: `' + playerCount + '`')
      } else if (msg.content.startsWith('_players ' + server)) {
        let reply = 'Players on ' + server + ': \n```'

        for (const player in bot.players) {
          reply = reply + player + '\n'
        }

        reply = reply + '```'

        msg.reply(reply)
      } else if (msg.content.startsWith('_info ' + server)) {
        mc.ping({
          host: config.host,
          port: config.port,
          version: config.MCversion
        }, function (err: Error, pingResult: NewPingResult) {
          if (err) {
            console.log(err)
            msg.reply('Sorry something went wrong. :(')
          } else {
            if (pingResult.favicon === undefined)
              return

            const base64Image: string | undefined = pingResult.favicon.split(';base64,').pop()

            if (base64Image === undefined) {
              return
            }

            fs.writeFile(server + '.png', base64Image, { encoding: 'base64' }, function (err: NodeJS.ErrnoException | null) {
              if (err != null) {
                console.log(err)
              }

              console.log('File created')
            })

            console.log(parseJSON(pingResult.description))

            const favicon = [new Discord.MessageAttachment('./' + server + '.png', server + '.png')]
            const embed = new Discord.MessageEmbed()
              .setTitle(server + '\'s Status')
              .setColor('#C970D9')
              .attachFiles(favicon)
              .setThumbnail('attachment://' + server + '.png')
              .addField('Players:', pingResult.players.online.toString() + ' / ' + pingResult.players.max.toString())
              .addField('Motd:', replaceColor(parseJSON(pingResult.description)))
              .setFooter('PistonBot made by Pistonmaster', 'https://avatars0.githubusercontent.com/u/40795980?s=460&v=4')
              .setURL(discordConfig.website)
              .setTimestamp(Date.now())

            msg.channel.send(embed)
          }
        })
      } else if (msg.content.startsWith('_tps ' + server)) {
        msg.reply('Current tps: `' + bot.getTps() + '`')
      } else if (msg.content.startsWith('_servers')) {
        msg.channel.send('`' + server + '`')
      } else if (msg.content.startsWith('_setupbridge ' + server)) {
      }
    } else {
      if (msg.content.startsWith('_restart')) {
        if (msg.author.id === discordConfig.ownerid) {
          end = true
        }
      } else {
        bot.chat('> [ChatBridge] ' + msg.author.username + ': ' + msg.content)
      }
    }
  }
})

client.login(secretsFile.token).catch(console.error)

function replaceColor (msg: string): string {
  return msg.replace(/§4/gi, '').replace(/§c/gi, '').replace(/§6/gi, '').replace(/§e/gi, '').replace(/§2/gi, '').replace(/§a/gi, '').replace(/§b/gi, '').replace(/§3/gi, '').replace(/§1/gi, '').replace(/§9/gi, '').replace(/§d/gi, '').replace(/§5/gi, '').replace(/§f/gi, '').replace(/§7/gi, '').replace(/§8/gi, '').replace(/§0/gi, '').replace(/§r/gi, '').replace(/§l/gi, '').replace(/§o/gi, '').replace(/§n/gi, '').replace(/§m/gi, '').replace(/§k/gi, '').replace('@', '(at)')
}

interface PistonBot extends Bot {
  pathfinder: Pathfinder
  viewer: any
  autoEat: any
  getTps: () => number
}

function isNumber (str: string): boolean {
  return /^[0-9]*$/.test(str)
}
