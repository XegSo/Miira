const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');
const { adminCache } = require('../../commands/collabs/collabs');
const deleteCache = new Map();

module.exports = {
    data: {
        name: 'delete-collab'
    },
    async execute(int) {
        const collab = collabCache.get(int.user.id).collab;
        if (collab.host !== int.user.id) {
            int.reply('You are not allowed to do this.');
            return;
        }

        let initializedMap;
        if (collabCache.size > 0) {
            if (typeof collabCache.get(int.user.id) !== 'undefined') {
                initializedMap = collabCache;
            }
        }
        if (adminCache.size > 0) {
            if (typeof adminCache.get(int.user.id) !== 'undefined') {
                initializedMap = adminCache;
            }
        }
        deleteCache.set(int.user.id, {
            collab: initializedMap.get(int.user.id).collab
        });

        const modal = new ModalBuilder()
            .setCustomId('delete-collab')
            .setTitle('Collab deletion');

        const title = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Type the name of the collab to delete it')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);


        modal.addComponents(new ActionRowBuilder().addComponents(title));

        await int.showModal(modal);
    },
    deleteCache: deleteCache
};
