const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const SuggestionCache = new Map();

module.exports = {
    data: {
        name: 'suggestion-deny'
    },
    async execute(int, client) {
        const suggestion = await localFunctions.getSuggestion(client, int.message.id);
        if (suggestion.user === int.user.id) {
            await localFunctions.liquidateSuggestion(client, int.message.id);
            int.message.delete();
            int.reply({ content: 'Suggestion successfully removed.', ephemeral: true });
            return;
        }
        if (!localConstants.staffUserIds.includes(int.user.id)) {
            int.reply({ content: 'You cannot deny suggestions.', ephemeral: true });
            return;
        }
        if (suggestion.status === 'Approved.' || suggestion.status === 'Denied.') return;

        const modal = new ModalBuilder()
            .setCustomId('suggestion-denial')
            .setTitle('Suggestion denial');

        const textInput = new TextInputBuilder()
            .setCustomId('text-reason')
            .setLabel('Insert the reason for denial.')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);


        modal.addComponents(new ActionRowBuilder().addComponents(textInput));
        SuggestionCache.set(int.user.id, {
            message: int.message
        });

        await int.showModal(modal);
    },
    SuggestionCache: SuggestionCache
};
