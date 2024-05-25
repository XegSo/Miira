const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');

module.exports = {
    data: {
        name: 'delete-collab'
    },
    async execute(int, client) {
        const collab = collabCache.get(int.user.id).collab
        if (collab.host !== int.user.id) {
            int.reply('You are not allowed to do this.');
            return;
        }
        if (collabCache.size === 0) {
            int.reply('Open the dashboard again. The collab hasn\'t been cached');
            return;
        }
        const modal = new ModalBuilder()
            .setCustomId("delete-collab")
            .setTitle('Collab deletion');

        const title = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Type the name of the collab to delete it')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);


        modal.addComponents(new ActionRowBuilder().addComponents(title));

        await int.showModal(modal);
    },
    deleteCache: collabCache
}