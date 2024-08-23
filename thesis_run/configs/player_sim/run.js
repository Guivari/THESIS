// Usage: node mineflayer_forge.js
// Change values of host, port, username before using. Tested with 1.19.2 Minecraft offline server.

const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder')
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear, GoalXZ } = require('mineflayer-pathfinder').goals
const autoVersionForge = require('minecraft-protocol-forge').autoVersionForge
const v = require("vec3");

const host = process.argv[2]
const port = process.argv[3]

const overworld_TP = `309 70 257`
const theEnd_TP = `1757 65 -456`
const theNether_TP = `80 38 240`
const twilight_TP = `30 5 35`

const build_height = 257
const overworld_TP_BH = `309 257 257`
const theEnd_TP_BH = `1757 257 -456`
const theNether_TP_BH = `80 257 240`
const twilight_TP_BH = `30 257 35`

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function BotEndTest (name) {

  const bot = mineflayer.createBot({
    version: false,
    host,
    port,
    username: name,
    auth: 'offline'
  })
  
  const options = {
    forgeMods: undefined,
    channels: undefined
  }
  
  autoVersionForge(bot._client, options)
  bot.loadPlugin(pathfinder.pathfinder)

  role = "end test"

  bot.on('spawn', async () => {
    bot.chat(`end test`);
  }) 
}


function BotWalker (name, location = overworld_TP, dimension=`minecraft:overworld`, range) {
  
  const bot = mineflayer.createBot({
    version: false,
    host,
    port,
    username: name,
    auth: 'offline'
  })
  
  const options = {
    forgeMods: undefined,
    channels: undefined
  }
  
  autoVersionForge(bot._client, options)
  bot.loadPlugin(pathfinder.pathfinder)

  role = "walker"

  function nextGoal(bot, walkLoop) {
    let x = bot.entity.position.x
    let z = bot.entity.position.z
    if (walkLoop == 1)
      x += range
    else if (walkLoop == 2)
      z += range
    else if (walkLoop == 3)
      x -= range
    else if (walkLoop == 4)
      z -= range
    else throw "error, not a valid walkLoop"

    console.log("Walking to: ", x, ", ", z)
    return new GoalXZ(x, z);
}
  
  bot.on('spawn', async () => {
    bot.chat(`walker,${location},${dimension}`)
  })

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return 

    if (message === `${bot.username} OK`) {
      // let defaultMove = new Movements(bot)
      // defaultMove.allowSprinting = false
      // defaultMove.canDig = false
      // bot.pathfinder.setMovements(defaultMove)
      const mcData = require('minecraft-data')(bot.version)
      const movements = new Movements(bot, mcData)
      bot.pathfinder.setMovements(movements)

      movements.allowSprinting = true
      movements.canDig = true

      let walkLoop = 1

      while (walkLoop > 0) {
        if (walkLoop > 4)
          walkLoop = 1

        let goal = nextGoal(bot, walkLoop);
        try {
            await bot.pathfinder.goto(goal)
        } catch (e) {
            if (e.name != "NoPath" && e.name != "Timeout") {
                // throw e
            }
        }
        walkLoop += 1
        await bot.waitForTicks(20)
      }
    } else return

  }) 
}

function BotChunkLoader(name, location = overworld_TP, facing = `0 0`, dimension = `minecraft:overworld`, moveX, moveZ) {
  const bot = mineflayer.createBot({
    version: false,
    host,
    port,
    username: name,
    auth: 'offline'
  })
  
  const options = {
    forgeMods: undefined,
    channels: undefined
  }
  
  autoVersionForge(bot._client, options)
  bot.loadPlugin(pathfinder.pathfinder)

  role = "chunk loader"
  
  bot.on('spawn', async () => {
    bot.creative.startFlying
    bot.chat(`chunkLoader,${location} ${facing},${dimension}`)
    bot.creative.startFlying
  })

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return

    if (message === `${bot.username} OK`) {
      let x = bot.entity.position.x
      let z = bot.entity.position.z
      await bot.creative.flyTo(v(x + moveX, 257, z + moveZ))
    } else return

  }) 
}

function BotOP(name) {

  const bot = mineflayer.createBot({
    version: false,
    host,
    port,
    username: name,
    auth: 'offline'
  })
  
  const options = {
    forgeMods: undefined,
    channels: undefined
  }
  
  autoVersionForge(bot._client, options)
  bot.loadPlugin(pathfinder.pathfinder)

  role = "operator"

  bot.on('connect', function () {
    let botSocket = bot._client.socket;
    console.info(`Connected to ${botSocket.server ? botSocket.server : botSocket._host}`);
  })
  
  bot.on('login', () => {
    let botSocket = bot._client.socket;
    console.info(`Logged in to ${botSocket.server ? botSocket.server : botSocket._host}`)
  })
  
  bot.on('spawn', () => {
    console.info(`I am ${role}`);
    bot.chat(`/gamemode spectator`)
    bot.waitForTicks(50);
    bot.chat(`/gamerule disableElytraMovementCheck true`)
    bot.chat(`/spark profiler start`)
  })

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return

    request = message.split(`,`)
    // bot.chat(`MESSAGE FROM ${username} OK`)

    if (request[0] == "walker") {
      bot.chat(`/execute in ${request[2]} run tp ${username} ${request[1]}`)
      bot.chat(`/execute in ${request[2]} run effect give ${username} resistance 999 225`)
      bot.chat(`/execute in ${request[2]} run effect give ${username} regeneration 999 225`)
      await bot.waitForTicks(15*20);
      bot.chat(`/execute in ${request[2]} run effect give ${username} resistance 999 225`)
      bot.chat(`/execute in ${request[2]} run effect give ${username} regeneration 999 225`)
      bot.chat(`/give ${username} minecraft:diamond_axe`)
      bot.chat(`/give ${username} minecraft:diamond_pickaxe`)
      bot.chat(`/give ${username} minecraft:cobblestone 999`)
      bot.chat(`${username} OK`)
      await bot.waitForTicks(15*20);
      bot.chat(`/execute in ${request[2]} run effect give ${username} resistance 999 225`)
      bot.chat(`/execute in ${request[2]} run effect give ${username} regeneration 999 225`)

    } else if (request[0] == "chunkLoader") {
      bot.chat(`/gamemode spectator ${username}`)
      bot.chat(`execute in ${request[2]} run tp ${username} ${request[1]}`)
      bot.chat(`/execute in ${request[2]} run tp ${username} ${request[1]}`)

      await bot.waitForTicks(15*20);
      bot.chat(`/execute in ${request[2]} run gamemode spectator ${username}`)
      await bot.waitForTicks(15*20);
      bot.chat(`/execute in ${request[2]} run gamemode spectator ${username}`)
      bot.chat(`/execute in ${request[2]} run tp ${username} ${request[1]}`)
      bot.chat(`${username} OK`)

    } else if (request[0] === "end test") {
      bot.chat(`/spark profiler stop`)
      await bot.waitForTicks(1200)
      bot.chat(`${username} OK`)
      process.exit(0)

    }
    // } else if (message === "fighter") {

    // } else if (message === "fighter") {

    // } else if (message === "breeder") {

    // } else if (message === "nether_walker") {

    // } else if (message === "XP_farmer") {

    // } else if (message === "trader") {

    // }


  }) 

}

try {
  setTimeout(BotOP, 1 * 1000, "BotOP")
  setTimeout(BotChunkLoader, 5 * 1000, "BotCL1",     overworld_TP_BH,  `0 0`,    `minecraft:overworld`, 99999, -99999)
  // setTimeout(BotChunkLoader, 6 * 1000, "BotCL2",     overworld_TP_BH,  `-180 0`, `minecraft:overworld`, 99999, 99999)
  // setTimeout(BotChunkLoader, 7 * 1000, "BotCL3",     overworld_TP_BH,  `0 0`,    `minecraft:overworld`, -99999, -99999)
  setTimeout(BotChunkLoader, 5 * 1000, "BotCL4",     overworld_TP_BH,  `-180 0`, `minecraft:overworld`, -99999, 99999)
  setTimeout(BotWalker, 9 * 100, "BotWalk1", '321 70 509', `minecraft:overworld`, 32)
  // setTimeout(BotWalker, 10 * 1000, "BotWalk4", '309 70 171', `minecraft:overworld`, 32)
  // setTimeout(BotWalker, 6 * 1000, "BotWalk2", '-1232 64 417', `minecraft:overworld`, 32)
  setTimeout(BotWalker, 12 * 1000, "BotWalk3", '-1341 64 305', `minecraft:overworld`, 32)



  // setTimeout(BotChunkLoader, 31 * 1000, "BotCLND1", theNether_TP_BH,  `0 0`,    `minecraft:the_nether`, 99999, -99999)
  // setTimeout(BotChunkLoader, 32 * 1000, "BotCLND2", theNether_TP_BH,  `0 0`,    `minecraft:the_nether`, -99999, 99999)
  // setTimeout(BotWalker, 33 * 1000, "BotWalkND1", "213 54 1325", `minecraft:the_nether`, 16)
  // setTimeout(BotWalker, 34 * 1000, "BotWalkND2", "21 45 142", `minecraft:the_nether`, 16)
  // ---
  // setTimeout(BotChunkLoader, 5 * 1000, "BotCLND3", theNether_TP_BH,  `0 0`,    `minecraft:the_nether`, -99999, -99999)
  // setTimeout(BotChunkLoader, 5 * 1000, "BotCLND4", theNether_TP_BH,  `0 0`,    `minecraft:the_nether`, 99999, 99999)
  // setTimeout(BotWalker, 185 * 1000, "BotWalkND3", theNether_TP, `minecraft:the_nether`)
  // setTimeout(BotWalker, 185 * 1000, "BotWalkND4", theNether_TP, `minecraft:the_nether`)
  


  setTimeout(BotChunkLoader, 7 * 1000, "BotCLTL1", twilight_TP_BH,  `0 0`,    `twilightforest:twilight_forest`, 99999, -99999)
  // setTimeout(BotChunkLoader, 32 * 1000, "BotCLTL2", twilight_TP_BH,  `0 0`,    `twilightforest:twilight_forest`, -99999, 99999)
  setTimeout(BotWalker, 33 * 1000, "BotWalkTL1", "30 5 35", `twilightforest:twilight_forest`, 16)
  // setTimeout(BotWalker, 8 * 1000, "BotWalkTL2", "68 8 976", `twilightforest:twilight_forest`, 16)
  // ---
  // setTimeout(BotChunkLoader, 5 * 1000, "BotCLTL1",     twilight_TP_BH,  `0 0`,    `twilightforest:twilight_forest`, 9999, -9999)
  // setTimeout(BotChunkLoader, 5 * 1000, "BotCLTL2",     twilight_TP_BH,  `-180 0`, `twilightforest:twilight_forest`, 9999, 9999)
  // setTimeout(BotChunkLoader, 5 * 1000, "BotCLTL3",     twilight_TP_BH,  `0 0`,    `twilightforest:twilight_forest`, -9999, -9999)
  // setTimeout(BotChunkLoader, 5 * 1000, "BotCLTL4",     twilight_TP_BH,  `-180 0`, `twilightforest:twilight_forest`, -9999, 9999)
  // setTimeout(BotWalker, 5 * 1000, "BotWalkTL1", twilight_TP, `twilightforest:twilight_forest`)
  // setTimeout(BotWalker, 5 * 1000, "BotWalkTL2", twilight_TP, `twilightforest:twilight_forest`)
  // setTimeout(BotWalker, 5 * 1000, "BotWalkTL3", twilight_TP, `twilightforest:twilight_forest`)
  // setTimeout(BotWalker, 5 * 1000, "BotWalkTL4", twilight_TP, `twilightforest:twilight_forest`)

  setTimeout(BotEndTest, 6 * 60 * 1000, "BotEndTest")
} catch (e) {
  console.log(e)
}