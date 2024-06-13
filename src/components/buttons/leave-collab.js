const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const { profileButtonCache } = require('./profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const leaveCache = new Map();

module.exports = {
    data: {
        name: 'leave-collab'
    },
    async execute(int, client) {
        const userId = int.user.id;
        let initializedMap;
        if (profileMenuCache.size > 0) {
            if (typeof profileMenuCache.get(int.user.id) !== 'undefined') {
                initializedMap = profileMenuCache;
            }
        }
        if (profileButtonCache.size > 0) {
            if (typeof profileButtonCache.get(int.user.id) !== 'undefined') {
                initializedMap = profileButtonCache;
            }
        }

        const collab = initializedMap.get(userId).collab;
        const collection = client.db.collection('OzenCollection');
        const userCollabData = await localFunctions.getUserCollabs(userId, collection);
        const currentCollab = userCollabData.find(e => e.collabName === collab.name);
        const currentPick = currentCollab.collabPick.name;
        const modal = new ModalBuilder()
            .setCustomId('leave-collab')
            .setTitle(`${collab.name}`);

        const pick = new TextInputBuilder()
            .setCustomId('pick')
            .setLabel('Type the name of your pick to leave.')
            .setPlaceholder(`${currentPick}`)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(pick));

        leaveCache.set(int.user.id, {
            collab: currentCollab
        });

        await int.showModal(modal);
    },
    leaveCache: leaveCache
};
