const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const rest = new REST().setToken(process.env.TOKEN);
const clientId = '959278677789663302';
const guildId = '630281137998004224';

class CommandLoader {
    constructor(commands, commandArray) {
        this.commands = commands
        this.commandArray = commandArray
        this.init();
    }

    init() {
        fs.readdirSync(path.join(__dirname, "../../commands")).filter((file) => {
            if (file.endsWith('.js')) {
                const command = require(path.join(__dirname, (`../../commands/${file}`)));
                this.commands.set(command.data.name, command);
                this.commandArray.push(command.data.toJSON());
                console.log(`Command: ${command.data.name} has been loaded.`);
            }
        })
    }

    readFolder(folder) {
        fs.readdirSync(path.join(__dirname, `../../commands/${folder}`)).filter((file) => {
            if (file.endsWith('.js')) {
                const command = require(path.join(__dirname, (`../../commands/${folder}/${file}`)));
                this.commands.set(command.data.name, command);
                this.commandArray.push(command.data.toJSON());
                console.log(`Command: ${command.data.name} has been loaded.`);
            }
        })
    }
}

module.exports = (client) => {
    client.handleCommands = async () => {
        const { commands, commandArray } = client;

        const loader = new CommandLoader(commands, commandArray);
        loader.readFolder('admin');
        loader.readFolder('collabs');
        loader.readFolder('economy');

        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: client.commandArray },
            );

            console.log('Succesfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }

    }

    // If the fuckers dupe then hardreset them.
    client.hardReset = async () => {
        // for guild-based commands
        rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
            .then(() => console.log('Successfully deleted all guild commands.'))
            .catch(console.error);

        // for global commands
        rest.put(Routes.applicationCommands(clientId), { body: [] })
            .then(() => console.log('Successfully deleted all application commands.'))
            .catch(console.error);
    }
};
