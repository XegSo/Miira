const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.handleCommands = async() => {
        const { commands, commandArray } = client;

        fs.readdirSync(path.join(__dirname, "../../commands/tools")).filter((file) => {
            if (file.endsWith('.js')) {
                const command = require(path.join(__dirname, (`../../commands/tools/${file}`)));
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                console.log(`Command: ${command.data.name} has been loaded.`);
            }
        })
    }

    // Si SlashCommands se duplican entonces hacer hardreset.
    client.hardReset = async()  => {
        const guild = await client.guilds.fetch('630281137998004224');
        const { commands } = client;
        commands.set([]);
        guild.commands.set([]);
    }
};