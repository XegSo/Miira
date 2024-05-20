const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'check-pick'
    },
    async execute(int, client) {
        const modal = new ModalBuilder()
                .setCustomId("check-pick")
                .setTitle(`Check a Character`);

            const pick = new TextInputBuilder()
                .setCustomId('pick')
                .setLabel('Type the ID of the character.')
                .setPlaceholder('Only the ID of the character. Check spreadsheet.')
                .setStyle(TextInputStyle.Short)


            modal.addComponents(new ActionRowBuilder().addComponents(pick));

            await int.showModal(modal);
    },
}