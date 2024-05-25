const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');

module.exports = {
    data: {
        name: 'deliver-collab'
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
            .setCustomId("deliver-collab")
            .setTitle('Deliver this collab');

        const bucket = new TextInputBuilder()
            .setCustomId('bucket')
            .setLabel('Type the bucket name of the cloud')
            .setStyle(TextInputStyle.Short)

        modal.addComponents(new ActionRowBuilder().addComponents(bucket));

        await int.showModal(modal);
    },
}