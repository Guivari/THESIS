# THESIS
Benchmarking the performance impact of mods on Minecraft-like environments

As of 14 August 2024, this benchmark requires 
 - openjdk 19.0.1 2022-10-18
 - nvm v22.3.0


If you are using this repo for the first time, the Forge and Mineflayer envrinments might not yet be set up.
The following lists how to setup the benchmark.

Mineflayer to create the bots that simulates player behavior
 - npm init -y
 - npm install mineflayer
 - npm install mineflayer-pathfinder
 - npm install minecraft-pathfinder
 - npm install minecraft-data
 - npm i https://github.com/PrismarineJS/node-minecraft-protocol-forge/tree/master

Using Forge Mod Loader as the Minecraft-like environment
 - wget https://maven.minecraftforge.net/net/minecraftforge/forge/1.19.2-43.4.0/forge-1.19.2-43.4.0-installer.jar
 - java -jar forge-1.19.2-43.4.0-installer.jar --installServer
 - Expect "You can delete this installer file now if you wish"
 - ./run.sh
 - Expect "You need to agree to the EULA in order to run the server. Go to eula.txt for more info."
 - cat ../../configs/eula.txt > eula.txt
 - ./run.sh
 - expect "For help, type "help""
 - SEND stop
 - cat ../../configs/server.properties > server.properties


