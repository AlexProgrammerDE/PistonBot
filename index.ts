import MinecraftData from 'minecraft-data'
import {Bot} from 'mineflayer'
import {Entity, EntityType} from 'prismarine-entity'
import {Window} from 'prismarine-windows'
import {Item as PrismarineItem} from 'prismarine-item'
import {Pathfinder} from 'mineflayer-pathfinder'
import {Channel, Client, MessageEmbed, TextChannel} from 'discord.js'
import {NewPingResult} from 'minecraft-protocol'

const mineflayer = require('mineflayer')
const inventoryViewer = require('mineflayer-web-inventory')
const tpsPlugin = require('mineflayer-tps')(mineflayer)
const armorManager = require('mineflayer-armor-manager')
const mc = require('minecraft-protocol')

const viewer = require('prismarine-viewer').mineflayer
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const {GoalNear, GoalBlock, GoalXZ, GoalY, GoalFollow} = require('mineflayer-pathfinder').goals

const express = require('express')
const pretty = require('express-prettify')
const helmet = require('helmet')

const fs = require('fs')
const ud = require('urban-dictionary')
const Discord = require('discord.js')

const commands = require('./data/commands')
const bible = require('./data/bible')
const spam = require('./data/spam')

const client: Client = new Discord.Client({disableEveryone: true})
const app = express()
const server = process.argv[2]

const secretsFile = require('./secrets.json')[server]
const serverSecrets = require('./secrets.json')[server]
const modules = require('./modules.json')[server]
const config = require('./config.json')[server]

const discordConfig = require('./discord.json')

let isEating = false
let end = false

const time: number = 10

const bot: PistonBot = mineflayer.createBot({
    host: config.host,
    username: serverSecrets.username,
    port: config.port,
    version: config.MCversion,
    hideErrors: true,
    checkTimeoutInterval: 300 * 1000
})

const parseJSON = require('minecraft-protocol-chat-parser')(bot.protocolVersion).parseJSON

const mcData: MinecraftData.IndexedData = require('minecraft-data')(bot.version)
const foodType: number[] = [
    mcData.itemsByName.apple.id,
    mcData.itemsByName.mushroom_stew.id,
    mcData.itemsByName.bread.id,
    mcData.itemsByName.cooked_porkchop.id,
    mcData.itemsByName.golden_apple.id,
    mcData.itemsByName.cookie.id,
    mcData.itemsByName.melon.id,
    mcData.itemsByName.cooked_beef.id,
    mcData.itemsByName.cooked_chicken.id,
    mcData.itemsByName.carrot.id,
    mcData.itemsByName.potato.id,
    mcData.itemsByName.baked_potato.id,
    mcData.itemsByName.golden_carrot.id,
    mcData.itemsByName.cooked_rabbit.id,
    mcData.itemsByName.rabbit_stew.id,
    mcData.itemsByName.cooked_mutton.id
]

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

bot.on('spawn', function () {
    fs.writeFile('./time.txt', time.toString(), function (err: any) {
        if (err) {
            console.log(err)
        }
    })

    if (serverSecrets["ingamepassword"] !== undefined)
      bot.chat('/login ' + serverSecrets["ingamepassword"])
})

function text(username: string, message: string, whisper: boolean) {
    fs.writeFile('./time.txt', time.toString(), function (err: any) {
        if (err) {
            console.log(err)
        }
    })

    let playerJoin = require('./data/playerjoin.json')
    let playerData: any = require('./data/playerdata.json')
    let executed: boolean = false
    let prefix: string
    const messageSplit: string[] = message.split(' ')

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

    if (whisper) {
        prefix = '/tell ' + username + ' '
    } else {
        prefix = ''
    }

    // ONLY COMMAND
    if (message.startsWith('_hi') && modules.hi) {
        bot.chat('Hi ' + username + '! Nice to meet you! <3')
        executed = true
    }

    if (message.startsWith('_coords') && modules.coords) {
        bot.chat(prefix + 'My coords are: ' + Number.parseInt(String(bot.entity.position.x)) + ' ' + Number.parseInt(String(bot.entity.position.y)) + ' ' + Number.parseInt(String(bot.entity.position.z)))
        executed = true
    }

    if (message.startsWith('_tps') && modules.tps) {
        bot.chat(prefix + 'Current tps: ' + bot.getTps())
        executed = true
    }

    if (modules.navigation && (!whisper)) {
        if (message.startsWith('_come')) {
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

        if (message.startsWith('_stop')) {
            if (bot.players[username] === undefined || bot.players[username].entity == null) {
                bot.chat('Sorry only player which i see are allowed to use this command.')
            } else {
                bot.chat('Stopping...')
                bot.pathfinder.setMovements(defaultMove)
                bot.pathfinder.setGoal(new GoalBlock(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z))
                bot.clearControlStates()
            }
            executed = true
        }

        if (message.startsWith('_follow')) {
            if (bot.players[username] === undefined || bot.players[username].entity == null) {
                bot.chat(username + ' it seems like your out of range.')
            } else {
                const target = bot.players[username].entity
                bot.chat('Starting folowing ' + username + '.')
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

    // TODO
    if (message.startsWith('_ping') && modules.ping) {
        if (message === '_ping' || (messageSplit.length > 1 && bot.players[messageSplit[1]] === undefined)) {
            if (bot.players[username]) {
                bot.chat(prefix + username + ' your ping is: ' + bot.players[username].ping)
            } else {
                bot.chat(prefix + 'Sorry i can only ping players.')
            }
        } else {
            if (messageSplit.length === 2) {
                if (bot.players[messageSplit[1]]) {
                    if (messageSplit[1] === username) {
                        if (bot.players[username]) {
                            bot.chat(prefix + username + ' your ping is: ' + bot.players[username].ping)
                        } else {
                            bot.chat(prefix + 'Sorry i can only ping players.')
                        }
                    } else {
                        bot.chat(prefix + 'The ping of ' + bot.players[messageSplit[1]].username + ' is: ' + bot.players[messageSplit[1]].ping)
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

    if (message.startsWith('_gamemode') && modules.gamemode) {
        if (message === '_gamemode') {
            if (bot.players[username] && bot.players[username].gamemode) {
                bot.chat(prefix + username + ' your ping is: ' + bot.players[username].gamemode)
            } else {
                bot.chat(prefix + 'Sorry i cann\'t find you.')
            }
        } else {
            if (messageSplit.length === 2) {
                if (bot.players[messageSplit[1]] && bot.players[messageSplit[1]].gamemode) {
                    if (messageSplit[1] === username) {
                        if (bot.players[username]) {
                            bot.chat(prefix + username + ' your ping is: ' + bot.players[username].gamemode)
                        } else {
                            bot.chat(prefix + 'Sorry i cann\'t find you.')
                        }
                    } else {
                        bot.chat(prefix + 'The _gamemode of ' + bot.players[messageSplit[1]].username + ' is: ' + bot.players[messageSplit[1]].gamemode)
                    }
                } else {
                    bot.chat(prefix + "Sorry i can't find that player.")
                }
            } else {
                bot.chat(prefix + 'Sorry you didnt use: _gamemode username')
            }
        }
        executed = true
    }

    if (message.startsWith('_help') && modules.help) {
        bot.chat('/tell ' + username + ' PistonBot help: _tps, _ping, _coords, _tpa, _tpy, _rules, _report, _bible, _about, _goto, _come, _stop, _rm, _lm, _fm, _wm, _urban, _discord')
        executed = true
    }

    if (message.startsWith('_discord')) {
        bot.chat('/tell ' + username + ' https://discord.gg/zBPKyC5')
        executed = true
    }

    if (modules.tp) {
        if (message.startsWith('_tpa')) {
            if (messageSplit.length === 2) {
                if (bot.entity.position.x >= 1000 || bot.entity.position.z >= 1000) {
                    bot.chat('/tpa ' + messageSplit[1])
                } else {
                    bot.chat(prefix + 'Sorry i am not 1000 blocks away from spawn. :(')
                }
            } else {
                bot.chat(prefix + 'Sorry you should use: _tpa username')
            }
            executed = true
        }

        if (message.startsWith('_tpy')) {
            if (messageSplit.length === 2) {
                bot.chat('/tpy ' + messageSplit[1])
            } else {
                bot.chat(prefix + 'Sorry you should use: _tpy username')
            }
            executed = true
        }
    }

    if (message.startsWith('_rules') && modules.rules) {
        bot.chat(prefix + "No rules, but pls don't spam, hack, dupe, xray, swear or grief.")
        executed = true
    }

    if (modules.ny && (!whisper)) {
        if (message.startsWith('_no')) {
            bot.chat('NO!')
            executed = true
        }

        if (message.startsWith('_yes')) {
            bot.chat('YES!')
            executed = true
        }
    }

    if (message.startsWith('_report') && modules.report) {
        if (messageSplit.length >= 3) {
            bot.chat(prefix + 'Reported ' + messageSplit[1] + ' for ' + message.replace('_report ' + messageSplit[1], ''))
        } else {
            bot.chat(prefix + 'Sorry you should use: _report username reason')
        }
        executed = true
    }

    if (modules.bible) {
        if (message.startsWith('_bible') || message.startsWith('_verse')) {
            bot.chat(prefix + bible.proverbs[Math.round(Math.random() * (bible.proverbs.length - 1))])
            executed = true
        }
    }

    if (message.startsWith('_about') && modules.about) {
        bot.chat(prefix + 'PistonBot coded by Pistonmaster with <3!')
        executed = true
    }

    if (message.startsWith('_say') && username === 'Pistonmaster') {
        const say = message.replace('_say ', '')

        bot.chat(say)
        executed = true
    }

    if (message.startsWith('_killbot') && username === 'Pistonmaster') {
        bot.chat('/kill')
        executed = true
    }

    if (message.startsWith('_wm') && !whisper) {
        playerJoin = require('./data/playerjoin.json')

        if (Object.keys(playerJoin).includes(username)) {
            console.log('Player is in the database. Reading the state.')
            if (playerJoin[username]) {
                console.log('message are true. Setting to false.')
                playerJoin[username] = false
                bot.chat(prefix + 'Deactivated welcome message. You can toggle them with: _wm')
            } else {
                console.log('message are false. Setting to true.')
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

    if (message.startsWith('_urban ')) {
        const term = message.slice(7)
        ud.term(term, (error: { message: any }, entries: Array<{ definition: any }>) => {
            if (error) {
                console.error(error.message)
            } else {
                let urbanAnswer = entries[0].definition

                urbanAnswer = urbanAnswer.replace(/\r?\n|\r/g, '')

                bot.chat('/tell ' + username + ' ' + urbanAnswer)
            }
        })
    }

    if (!whisper) {
        const split = message.split(' ')

        if (message.startsWith('_fm') || message.startsWith('_firstmessage')) {
            if (split.length === 1) {
                if (Object.keys(playerData).includes(username) && playerData[username][0] !== undefined) {
                    bot.chat(username + ' your first message which i recorded was: ' + playerData[username][0])
                } else {
                    bot.chat(username + ' sorry i didnt record any messages from you.')
                }
            } else if (split.length === 2) {
                if (Object.keys(playerData).includes(split[1]) && playerData[split[1]][0] !== undefined) {
                    bot.chat(username + ' here is the first message which i recorded from ' + split[1] + ': ' + playerData[split[1]][0])
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
                if (Object.keys(playerData).includes(username) && playerData[username][0] !== undefined) {
                    bot.chat(username + ' your last message which i recorded was: ' + playerData[username][playerData[username].length - 1])
                } else {
                    bot.chat(username + ' sorry i didnt record any messages from you.')
                }
            } else if (split.length === 2) {
                if (Object.keys(playerData).includes(split[1]) && playerData[split[1]][0] !== undefined) {
                    bot.chat(username + ' here is the last message which i recorded from ' + split[1] + ': ' + playerData[split[1]][playerData[split[1]].length - 1])
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
                if (Object.keys(playerData).includes(username) && playerData[username][0] !== undefined) {
                    bot.chat(username + ' here is a random message which i recorded from you: ' + playerData[username][Math.round(Math.random() * (playerData[username].length - 1))])
                } else {
                    bot.chat(username + ' sorry i didnt record any messages from you.')
                }
            } else if (split.length === 2) {
                if (Object.keys(playerData).includes(split[1]) && playerData[split[1]][0] !== undefined) {
                    bot.chat(username + ' here is a random message which i recorded from ' + split[1] + ': ' + playerData[split[1]][Math.round(Math.random() * (playerData[split[1]].length - 1))])
                } else {
                    bot.chat(username + ' sorry i didnt record any messages from ' + split[1] + '.')
                }
            } else if (split.length > 2) {
                bot.chat('Please use: _rm username or _rm')
            }

            executed = true
        }

        if (message.startsWith('_phrases') && username === 'Pistonmaster') {
            bot.chat('Calculating amount of ALL saved phrases.')

            playerData = require('./data/playerdata.json')
            let amount1 = 0

            for (const player1 in playerData) {
                amount1 = amount1 + playerData[player1].length
            }

            setTimeout(() => bot.chat('Amount of ALL phrases: ' + amount1), 2000)
        }

        if (message.startsWith('_words') && username === 'Pistonmaster') {
            bot.chat('Calculating amount of ALL saved words.')

            let amount2 = 0

            for (const player in playerData) {
                for (const phraseIndex in playerData[player]) {
                    const phraseText = playerData[player][phraseIndex]
                    const phraseSplit = phraseText.split(' ')
                    amount2 = amount2 + phraseSplit.length
                }
            }

            setTimeout(() => bot.chat('Amount of ALL words: ' + amount2), 2000)
        }

        if (!executed) {
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
}

bot.on('chat', function (username, message) {
    text(username, message, false)
})

bot.on('whisper', function (username, message, a, jsonMsg) {
    text(username, message, true)
})

if (modules.web.activated) {
    app.use(helmet())
    app.use(pretty({query: 'pretty'}))

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
        inventoryViewer(bot, {port: modules.inventory.port})
    }

    if (modules.viewer.activated) {
        viewer(bot, {port: modules.viewer.port})
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
        if (modules.eat) {
            if (!isEating && (bot.food !== 20)) {
                const food = checkFood(bot.inventory)

                if (food != null) {
                    bot.equip(food, 'hand', (err) => {
                        if (err != null) {
                            console.log(err)
                        }
                    })
                    isEating = true
                    bot.consume(function () {
                        isEating = false
                    })
                }
            }
        }

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
    }, 25)

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
    console.log('I can get there in ' + results.path.length + ' moves. Computation took ' + results.time.toFixed(2) + ' ms.')
})

function nearestEntity(type: EntityType | null): Entity | null {
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

function checkFood(window: Window): PrismarineItem | null {
    let food = null

    window.items().forEach(item => {
        if (foodType.includes(item.type)) {
            food = item
        }
    })

    return food
}

function checkWeapon(window: Window): PrismarineItem | null {
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
    if (client.user === null)
        return

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
                        const base64Image: string | undefined = pingResult.favicon.split(';base64,').pop()

                        if (base64Image  === undefined)
                            return

                        fs.writeFile(server + '.png', base64Image, {encoding: 'base64'}, function (err: NodeJS.ErrnoException | null) {
                            if (err) {
                                console.log(err)
                            }

                            console.log('File created')
                        })

                        console.log(parseJSON(pingResult.description))

                        const favicon = new Discord.MessageAttachment('./' + server + '.png', server + '.png')
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

client.login(secretsFile.token).then(r => console.log(r))

function replaceColor(msg: string): string {
    return msg.replace(/§4/gi, '').replace(/§c/gi, '').replace(/§6/gi, '').replace(/§e/gi, '').replace(/§2/gi, '').replace(/§a/gi, '').replace(/§b/gi, '').replace(/§3/gi, '').replace(/§1/gi, '').replace(/§9/gi, '').replace(/§d/gi, '').replace(/§5/gi, '').replace(/§f/gi, '').replace(/§7/gi, '').replace(/§8/gi, '').replace(/§0/gi, '').replace(/§r/gi, '').replace(/§l/gi, '').replace(/§o/gi, '').replace(/§n/gi, '').replace(/§m/gi, '').replace(/§k/gi, '').replace('@', '(at)')
}

interface PistonBot extends Bot {
    pathfinder: Pathfinder
    viewer: any
    getTps: () => number
}

function isNumber(str: string): boolean {
    return /^[0-9]*$/.test(str);
}