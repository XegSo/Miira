require('dotenv').config();

const { auth } = require('osu-api-extended');
const { MongoClient } = require('mongodb');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const Banchojs = require('bancho.js');
const discordToken = process.env.TOKEN;
const banchoPass = process.env.OSU_SECRET_V1;
const banchoUsername = process.env.OSU_USERNAME_V1;
const clientIDv2 = process.env.OSU_CLIENT_V2;
const clientSv2 = process.env.OSU_SECRET_V2;
const banchoClient = new Banchojs.BanchoClient({
    username: banchoUsername,
    password: banchoPass
});


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
    ]
});

client.commands = new Collection();
client.commandArray = [];
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

fs.readdirSync(path.join(__dirname, '/functions/handlers/')).forEach((file) => {
    require(`./functions/handlers/${file}`)(client);
    require(`./functions/handlers/${file}`)(banchoClient);
});

banchoClient.handleEvents(client);
client.handleEvents();
client.handleCommands();
client.handleComponents();

async function main() {
    // Connect to MongoDB.
    client.mongoClient = new MongoClient(process.env.MONGO);
    await client.mongoClient.connect();
    client.db = client.mongoClient.db('Ozen');
    console.log('Connected to MongoDB.');

    // Connect to Bancho.
    await banchoClient.connect();
    console.log('Connected to bancho.');

    // Connect to osu! API.
    await auth.login(clientIDv2, clientSv2, ['public']);
    console.log('Connected to osu api.');

    // Connect to Discord.
    await client.login(discordToken);
}

main();
