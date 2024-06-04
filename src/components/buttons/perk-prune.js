const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'perk-prune'
    },
    async execute(int, client) {

        const modal = new ModalBuilder()
            .setCustomId("perk-prune")
            .setTitle('Remove your perk entry');

        const title = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Type the name of the perk to delete it')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(title));

        await int.showModal(modal);
    },
}