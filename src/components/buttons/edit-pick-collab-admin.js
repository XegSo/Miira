const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'edit-pick-collab-admin'
    },
    async execute(int) {

        const modal = new ModalBuilder()
            .setCustomId('edit-pick-collab-admin')
            .setTitle('Edit the fields of a pick in the collab.');

        const ch_name = new TextInputBuilder()
            .setCustomId('ch_name')
            .setLabel('Character Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(ch_name));

        await int.showModal(modal);
    }
};
