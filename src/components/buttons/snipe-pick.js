const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { userCheckCache } = require('../../commands/collabs/collabs');


module.exports = {
    data: {
        name: 'snipe-pick'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
        try {
            const collab = userCheckCache.get(userId).collab;
            const pick = userCheckCache.get(userId).pick;
            const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            const existingTradeRequest = await localFunctions.getTradeRequest(userId, collectionSpecial);
            if (existingTradeRequest.length !== 0) {
                return await int.reply({ content: `You cannot snipe a pick when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }
            try {
                if (typeof userCollabs.find(uc => uc.collabName === collab.name) === "undefined") {
                    return await int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                }
            } catch {
                return await int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
            }
            const newPickFull = collab.pool.items.find(i => i.id === pick);
            if (newPickFull.status === "available") {
                return await int.editReply('This character is available! You can swap your pick.');
            }
            const pickRequested = newPickFull.id;

            let participants = collab.participants;
            const fullTraderParticipation = participants.find((e) => e.discordId === userId);
            if (fullTraderParticipation.id === pickRequested) {
                return await int.editReply('You cannot snipe yourself silly!');
            }
            const snipe = {
                pick: pick.id,
                userId: userId
            }
            await localFunctions.addCollabSnipe(collab.name, collection, snipe);
            await int.editReply('A notification if this pick becomes available will be sent to you! If the character becomes available and it gets picked by someone else, your would need to run this command again to get another notification.');
        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
            mongoClientSpecial.close();
        }
    }
}