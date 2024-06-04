const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { AttachmentBuilder } = require('discord.js');
const { collabCache } = require('./admin-collab');
const { adminCache } = require('../../commands/collabs/collabs');


module.exports = {
    data: {
        name: 'export-collab-perks'
    },
    async execute(int, client) {
        await int.deferReply();
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
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
        try {
            const collabName = initializedMap.get(int.user.id).collab.name
            const collab = await localFunctions.getCollab(collabName, collection);
            
            if (collab.host !== int.user.id) {
                int.editReply('You are not allowed to do this.');
                return;
            }
            let toExport = collab.perks.toExport;
            await Promise.all(Object.entries(toExport).map(async ([perk, userEntries]) => {
                for (let i = 0; i < userEntries.length; i++) {
                    await processUserEntry(userEntries[i], collection, collabName);
                }
            }));
            const excelBuffer = localFunctions.createExcelBuffer(toExport);
            const attachment = new AttachmentBuilder(excelBuffer, {
                name: `${collabName}-Premium Perks.xlsx`
            });
            await int.editReply({ files: [attachment] });
        } finally {
            mongoClient.close();
        }
    }
}

async function processUserEntry(userEntry, collection, collabName) {
    let participantDiscordId = "0";
    if (participantDiscordId !== userEntry.userId) {
        const pData = await localFunctions.getCollabParticipant(collabName, userEntry.userId, collection);
        if (typeof pData !== "undefined") {
            participantDiscordId = pData.discordId;
            delete pData.discordId;
            delete pData.av_text;
            delete pData.ca_text;
            delete pData.ca_quote;
            Object.assign(userEntry, pData);
        } else {
            console.log('An user has been found with claimed perks but not in the collab.');
        }
    }
}
