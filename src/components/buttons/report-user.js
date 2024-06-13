const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'report-user'
    },
    async execute(int) {
        const modal = new ModalBuilder()
            .setCustomId('report-user')
            .setTitle('Report an user');

        const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Type a report reason')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(new ActionRowBuilder().addComponents(reason));
        await int.showModal(modal);
    }
};
