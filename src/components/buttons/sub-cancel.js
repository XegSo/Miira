const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'sub-cancel'
    },
    async execute(int, client) {
        const modal = new ModalBuilder()
            .setCustomId("sub-cancel")
            .setTitle(`Cancel your subscription.`);

        const cancel = new TextInputBuilder()
            .setCustomId('cancel')
            .setLabel('Type \'yes\' to cancel')
            .setPlaceholder('yes')
            .setStyle(TextInputStyle.Short)
         
        modal.addComponents(new ActionRowBuilder().addComponents(cancel));    

        await int.showModal(modal);
    },
};