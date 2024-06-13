const localFunctions = require('../../functions');
const { userCheckCache } = require('../../commands/collabs/collabs');
const { userCheckCacheModal } = require('../modals/check-pick');


module.exports = {
    data: {
        name: 'snipe-pick'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const collection = client.db.collection('Collabs');
        const userCollection = client.db.collection('OzenCollection');
        const collectionSpecial = client.db.collection('Special');
        let initializedMap;
        if (userCheckCache.size > 0) {
            if (typeof userCheckCache.get(int.user.id) !== 'undefined') {
                initializedMap = userCheckCache;
            }
        }
        if (userCheckCacheModal.size > 0) {
            if (typeof userCheckCacheModal.get(int.user.id) !== 'undefined') {
                initializedMap = userCheckCacheModal;
            }
        }
        try {
            const collab = initializedMap.get(userId).collab;
            const pick = initializedMap.get(userId).pick;
            const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            const existingTradeRequest = await localFunctions.getTradeRequest(userId, collectionSpecial);
            if (existingTradeRequest.length !== 0) {
                return int.editReply({ content: `You cannot snipe a pick when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }
            try {
                if (typeof userCollabs.find(uc => uc.collabName === collab.name) === 'undefined') {
                    return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                }
            } catch {
                return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
            }
            if (pick.status === 'available') {
                return int.editReply('This character is available! You can swap your pick.');
            }
            const pickRequested = pick.id;

            let participants = collab.participants;
            const fullTraderParticipation = participants.find((e) => e.discordId === userId);
            if (fullTraderParticipation.id === pickRequested) {
                return int.editReply('You cannot snipe yourself silly!');
            }
            const snipe = {
                pick: pick.id,
                userId: userId
            };
            await localFunctions.addCollabSnipe(collab.name, collection, snipe);
            await int.editReply('A notification if this pick becomes available will be sent to you! If the character becomes available and it gets picked by someone else, your would need to run this command again to get another notification.');
        } catch (e) {
            console.log(e);
        }
    }
};
