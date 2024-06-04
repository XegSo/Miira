const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { AttachmentBuilder } = require('discord.js');
const { collabCache } = require('./admin-collab');


module.exports = {
    data: {
        name: 'export-collab-perks'
    },
    async execute(int, client) {
        await int.deferReply();
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        try {
            const collab = await localFunctions.getCollab(collabCache.get(int.user.id).collab.name, collection);
            if (collab.host !== int.user.id) {
                int.editReply('You are not allowed to do this.');
                return;
            }
            if (collabCache.size === 0) {
                int.editReply('Open the dashboard again. The collab hasn\'t been cached');
                return;
            }
            let toExport = collab.perks.toExport;
            let pData;
            for (const [perk, userEntries] of Object.entries(toExport)) {
                for (let i = 0; i < userEntries.length; i++) {
                    console.log(toExport[perk][i])
                    let participantDiscordId = "0";
                    if (participantDiscordId !== userEntries[i].userId) {
                        pData = await localFunctions.getCollabParticipant(collab.name, userEntries[i].userId, collection);
                        participantDiscordId = pData.discordId;
                        delete pData.discordId;
                        delete pData.av_text;
                        delete pData.ca_text;
                        delete pData.ca_quote;
                    }
                    Object.keys(pData).forEach(key => {
                        toExport[perk][i][key] = pData[key];
                    });
                }
            }
            const excelBuffer = localFunctions.createExcelBuffer(toExport);
            const attachment = new AttachmentBuilder(excelBuffer, {
                name: `${collab.name}-Premium Perks.xlsx`
            });
            await int.editReply({ files: [attachment] });
        } finally {
            mongoClient.close();
        }
    }
}