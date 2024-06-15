const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'sub-restart'
    },
    async execute(int) {
        const modal = new ModalBuilder()
            .setCustomId('sub-restart')
            .setTitle('Restart your subscription.');

        const newAmmount = new TextInputBuilder()
            .setCustomId('newAmmount')
            .setLabel('Input your new subscription amount.')
            .setPlaceholder('5$ minimum. Only type the number.')
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(newAmmount));

        await int.showModal(modal);
    }
};
