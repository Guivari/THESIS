# THESIS
Investigating the performance impact of mods on Minecraft-like environments

This paper inspired by and closely follows the paper "Yardstick: A benchmark for minecraft-like services" by Jesse Donkervliet

Mineflayer to create the bots that simulates player behavior
 - npm init 
 - npm install mineflayer
 - npm install mineflayer-pathfinder
 - npm i https://github.com/PrismarineJS/node-minecraft-protocol-forge/tree/master

Using Forge Mod Loader as the Minecraft-like environment
 - wget https://maven.minecraftforge.net/net/minecraftforge/forge/1.19.4-45.3.0/forge-1.19.4-45.3.0-installer.jar
 - java -jar forge-1.19.4-45.3.0-installer.jar ---installServer
 - // MODIFY user_jvm_args.txt TO UNCOMMENT LINE 9, THIS ALLOWS 4G OF RAM FOR THE SERVER
 - ./run.sh
 - // MODIFY EULA.txt TO SET eula=true

Modify server mods in THESIS/forge_server/mods
Modify server config in THESIS/forge_server/server.properties


