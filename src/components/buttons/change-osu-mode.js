const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'change-osu-mode'
    },
    async execute(int, client) {
        const modal = new ModalBuilder()
            .setCustomId('change-osu-mode')
            .setTitle('Change your gamemode.');

        const mode = new TextInputBuilder()
            .setCustomId('mode')
            .setLabel('Type your main gamemode')
            .setPlaceholder('osu | fruits | mania | taiko')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(mode));

        await int.showModal(modal);

    }
};
