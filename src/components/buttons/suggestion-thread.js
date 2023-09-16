const { PermissionsBitField } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'suggestion-thread'
    },
    async execute (int, client) {
        await int.deferReply({ ephemeral: true });
        const suggestion = await localFunctions.getSuggestion(int.message.id);
        const suggestionUser = await client.users.fetch(suggestion.user)
        try {           
            const thread = await int.message.startThread({
                name: `${suggestionUser.tag}'s suggestion thread`,
                autoArchiveDuration: 60,
            })
            thread.members.add(int.user.id);
            int.editReply({content: 'Thread created.', ephemeral: true});
        } catch (error) {
            int.editReply({content: 'A thread already has been created.', ephemeral: true});
            return;   
        }    
    },
};