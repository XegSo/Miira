const fs = require('node:fs');

module.exports = (client) => {
    client.handleEvents = async (discordClient) => {
        const eventFolders = fs.readdirSync('./src/events');
        for (const folder of eventFolders) {
            const eventFiles = fs
                .readdirSync(`./src/events/${folder}`)
                .filter((file) => file.endsWith('.js'));
            switch (folder) {
            case 'discordClient':
                for (const file of eventFiles) {
                    const event = require(`../../events/${folder}/${file}`);
                    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
                    else client.on(event.name, (...args) => event.execute(...args, client));
                }
                break;
            case 'banchoClient':
                for (const file of eventFiles) {
                    const event = require(`../../events/${folder}/${file}`);
                    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
                    else client.on(event.name, (...args) => event.execute(...args, client, discordClient));
                }
                break;
            default:
                break;
            }
        }
    };
};
