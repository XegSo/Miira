const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'trade-pick'
    },
    async execute(int, client) {
        const modal = new ModalBuilder()
            .setCustomId('trade-pick')
            .setTitle('Trade your collab pick.');

        const pick = new TextInputBuilder()
            .setCustomId('pick')
            .setLabel('Type the ID of the character to trade.')
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(pick));
        await int.showModal(modal);
    }
};
