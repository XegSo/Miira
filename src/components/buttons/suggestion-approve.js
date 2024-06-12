const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const SuggestionCache = new Map();

module.exports = {
    data: {
        name: 'suggestion-approve'
    },
    async execute (int, client) {
        if (!localConstants.staffUserIds.includes(int.user.id)) {
            int.reply({content: 'You cannot approve suggestions.', ephemeral: true});
            return;
        }
        const suggestion = await localFunctions.getSuggestion(client, int.message.id);
        if (suggestion.status === 'Approved.' || suggestion.status === 'Denied.') return;

        const modal = new ModalBuilder()
            .setCustomId("suggestion-approval")
            .setTitle('Suggestion approval');
                
        const textInput = new TextInputBuilder()
            .setCustomId('text-reason')
            .setLabel('Insert the reason for approval.')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        const reward = new TextInputBuilder()
            .setCustomId('reward')
            .setLabel('Insert the token reward (Up to 5000).')
            .setRequired(true)
            .setStyle(TextInputStyle.Short);    

        modal.addComponents(new ActionRowBuilder().addComponents(textInput), new ActionRowBuilder().addComponents(reward));
        SuggestionCache.set(int.user.id, {
            message: int.message,
        });

        await int.showModal(modal);
    },
    SuggestionCache: SuggestionCache
};

