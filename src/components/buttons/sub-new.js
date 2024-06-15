const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'sub-new'
    },
    async execute(int) {
        const modal = new ModalBuilder()
            .setCustomId('sub-new')
            .setTitle('Subscribe!');

        const newAmmount = new TextInputBuilder()
            .setCustomId('newAmmount')
            .setLabel('Input your subscription amount.')
            .setPlaceholder('5$ minimum. Only type the number.')
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(newAmmount));

        await int.showModal(modal);
    }
};
