const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { AttachmentBuilder } = require('discord.js');
const { collabCache } = require('./admin-collab');
const { createObjectCsvStringifier } = require('csv-writer');

module.exports = {
    data: {
        name: 'export-collab'
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
            const collabParticipants = await localFunctions.getCollabParticipants(collabCache.get(int.user.id).collab.name, collection);
            const headers = Object.keys(collabParticipants[0]);
            const csvStringifier = createObjectCsvStringifier({
                header: headers.map(header => ({ id: header, title: header }))
            });
            const csvData = csvStringifier.getHeaderString() + '\n' + csvStringifier.stringifyRecords(collabParticipants);
            const attachment = new AttachmentBuilder(Buffer.from(csvData), {
                name: `${collab.name} Data.csv`
            });
            await int.editReply({ files: [attachment] });
        } finally {
            mongoClient.close();
        }
    }
}