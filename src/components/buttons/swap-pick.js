const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'swap-pick'
    },
    async execute(int) {
        const modal = new ModalBuilder()
            .setCustomId('swap-pick')
            .setTitle('Swap your current pick.');

        const pick = new TextInputBuilder()
            .setCustomId('pick')
            .setLabel('Type the ID of the character to swap.')
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(pick));

        await int.showModal(modal);
    }
};
