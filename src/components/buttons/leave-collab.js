const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
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
        const initializedMap = [profileButtonCache, profileMenuCache].find(map => map.size > 0);
        const collab = initializedMap.get(userId).collab;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            const userCollabData = await localFunctions.getUserCollabs(userId, collection);
            const currentCollab = userCollabData.find(e => e.collabName === collab.name);
            const currentPick = currentCollab.collabPick.name;
            const modal = new ModalBuilder()
                .setCustomId("leave-collab")
                .setTitle(`${collab.name}`);

            const pick = new TextInputBuilder()
                .setCustomId('pick')
                .setLabel("Type the name of your pick to leave.")
                .setPlaceholder(`${currentPick}`)
                .setStyle(TextInputStyle.Short)

            modal.addComponents(new ActionRowBuilder().addComponents(pick));

            leaveCache.set(int.user.id, {
                collab: currentCollab,
              })

            await int.showModal(modal);
        } finally {
            mongoClient.close();
        }
    },
    leaveCache: leaveCache
};