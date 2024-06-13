const { TextInputStyle } = require('discord.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'verify-payment-sub'
    },
    async execute(int) {
        const modal = new ModalBuilder()
            .setCustomId('verify-payment-sub')
            .setTitle('Verify your Payment.');

        const email = new TextInputBuilder()
            .setCustomId('email')
            .setLabel('Input your paypal/kofi email to verify')
            .setPlaceholder('example@gmail.com')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(new ActionRowBuilder().addComponents(email));

        await int.showModal(modal);
    }
};
