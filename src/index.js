const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const token = process.env.TOKEN;
const fs = require('fs');
const path = require('path');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ],
});

const localFunctions = require('./functions');

client.commands = new Collection();
client.commandArray = [];
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

fs.readdirSync(path.join(__dirname, "/functions/handlers/")).filter((file) => {
  require(`./functions/handlers/${file}`)(client);
});

/*
client.handleEvents();
client.handleCommands();
client.handleComponents();
*/



client.on("ready", () => {
  client.hardReset();
})


// Start the daily decay schedule
localFunctions.scheduleDailyDecay();


client.login(token);
