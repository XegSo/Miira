const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');
const { adminCache }= require('../../commands/collabs/collabs');

module.exports = {
    data: {
        name: 'deliver-collab'
    },
    async execute(int, client) {
        let initializedMap;
        if (collabCache.size > 0) {
            if (typeof collabCache.get(int.user.id) !== "undefined") {
                initializedMap = collabCache;
            }
        }
        if (adminCache.size > 0) {
            if (typeof adminCache.get(int.user.id) !== "undefined") {
                initializedMap = adminCache;
            }
        }
        const collab = initializedMap.get(int.user.id).collab
        if (collab.host !== int.user.id) {
            int.reply('You are not allowed to do this.');
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