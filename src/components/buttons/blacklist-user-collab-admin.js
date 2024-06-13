const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'blacklist-user-collab-admin'
    },
    async execute(int) {
        const modal = new ModalBuilder()
            .setCustomId('blacklist-user-collab-admin')
            .setTitle('Blacklist an user from the collab');

        const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Type a reason')
            .setStyle(TextInputStyle.Short);


        modal.addComponents(new ActionRowBuilder().addComponents(reason));
        await int.showModal(modal);
    }
};
