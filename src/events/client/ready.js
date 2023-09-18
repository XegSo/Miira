const { ActivityType } = require('discord.js');
const localFunctions = require('./functions');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        localFunctions.scheduleDailyDecay(client);
        console.log('Ready.');
        await client.user.setPresence({
            activities: [{
                name: "you <3",
                type: ActivityType.Watching
            }],
            status: "online"
        })
    }
}