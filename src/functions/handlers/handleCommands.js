const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const rest = new REST().setToken(process.env.TOKEN);
const clientId = '959278677789663302';
const guildId = '630281137998004224';

module.exports = (client) => {
    client.handleCommands = async () => {
        const { commands, commandArray } = client;

        fs.readdirSync(path.join(__dirname, "../../commands/tools")).filter((file) => {
            if (file.endsWith('.js')) {
                const command = require(path.join(__dirname, (`../../commands/tools/${file}`)));
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                console.log(`Command: ${command.data.name} has been loaded.`);
            }
        })
        
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
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