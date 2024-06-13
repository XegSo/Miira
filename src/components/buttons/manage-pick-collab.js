const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'manage-pick-collab'
    },
    async execute(int) {
        const modal = new ModalBuilder()
            .setCustomId('manage-pick-collab')
            .setTitle('Manage an pick from the collab');

        const pick = new TextInputBuilder()
            .setCustomId('pick')
            .setLabel('Type the id of the pick')
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(pick));

        await int.showModal(modal);
    }
};
