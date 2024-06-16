const { ActivityType } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready.');

        client.user.setPresence({
            activities: [
                {
                    name: 'you <3',
                    type: ActivityType.Watching
                }
            ],
            status: 'online'
        });

        await localFunctions.scheduleDailyDecay(client);
    }
};
