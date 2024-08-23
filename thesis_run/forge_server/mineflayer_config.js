// Usage: node mineflayer_forge.js
// Change values of host, port, username before using. Tested with 1.19.2 Minecraft offline server.

const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder')
const autoVersionForge = require('minecraft-protocol-forge').autoVersionForge




const host = process.argv[2]
const port = process.argv[3]
const username = process.argv[4]


const bot = mineflayer.createBot({
  version: false,
  host,
  port,
  username
})

// leave options empty for guessing, otherwise specify the mods,
// channels and registries manually (channels and registries are only
// relevant for fml2 handshake)
const options = {
  forgeMods: undefined,
  channels: undefined
}

// add handler
autoVersionForge(bot._client, options)

bot.loadPlugin(pathfinder.pathfinder)
console.info('Started mineflayer')

// set up logging

const botBert = () => {
  bot.on('connect', function () {
    let botSocket = bot._client.socket;
    console.info(`Connected to ${botSocket.server ? botSocket.server : botSocket._host}`);
  })
  
  bot.on('login', () => {
    let botSocket = bot._client.socket;
    console.info(`Logged in to ${botSocket.server ? botSocket.server : botSocket._host}`)
  })
  
  //async makes it non-blocking
  bot.on('spawn', async () => {
    console.info('I spawned');
    bot.chat("What's up fuckers");
    
    await bot.waitForTicks(1000); //20 minecraft ticks in 1 second
    
    bot.chat("Cya");
    bot.waitForTicks(100);
    bot.quit();
  })

}

botBert();