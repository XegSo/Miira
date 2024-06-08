const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'start-bump'
    },
    async execute(int, client) {
        const modal = new ModalBuilder()
            .setCustomId("start-bump")
            .setTitle(`Start a new bump!`);

        const duration = new TextInputBuilder()
            .setCustomId('duration')
            .setLabel('Type the duration of the bump in days.')
            .setStyle(TextInputStyle.Short)

        modal.addComponents(new ActionRowBuilder().addComponents(duration));

        await int.showModal(modal);
    }
}