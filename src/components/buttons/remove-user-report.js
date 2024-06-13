const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'remove-user-report'
    },
    async execute(int, client) {
        const modal = new ModalBuilder()
            .setCustomId('remove-user-report')
            .setTitle('Remove an user from the collab');

        const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Type a reason')
            .setStyle(TextInputStyle.Short);


        modal.addComponents(new ActionRowBuilder().addComponents(reason));
        await int.showModal(modal);
    }
};
