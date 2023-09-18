const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const rest = new REST().setToken(process.env.TOKEN);
const clientId = '959278677789663302';
const guildId = '630281137998004224';

module.exports = (client) => {
    client.handleCommands = async () => {
        const { commands, commandArray } = client;

        // Function to recursively find .js files in a directory
        const getJsFiles = (dir) => {
            const files = fs.readdirSync(dir);
            const jsFiles = files.filter((file) => file.endsWith('.js'));
            const subDirs = files.filter((file) => fs.statSync(path.join(dir, file)).isDirectory());

            for (const subDir of subDirs) {
                const subDirPath = path.join(dir, subDir);
                jsFiles.push(...getJsFiles(subDirPath));
            }

            return jsFiles.map((file) => path.join(dir, file));
        };

        // Get all .js files in subfolders of the commands directory
        const jsFiles = getJsFiles(path.join(__dirname, "../../commands"));

        for (const file of jsFiles) {
            const command = require(file);
            commands.set(command.data.name, command);
            commandArray.push(command.data.toJSON());
            console.log(`Command: ${command.data.name} has been loaded.`);
        }
        
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