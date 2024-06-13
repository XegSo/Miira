const localFunctions = require('../../functions');
const { AttachmentBuilder } = require('discord.js');
const { collabCache } = require('./admin-collab');
const { adminCache } = require('../../commands/collabs/collabs');
const { createObjectCsvStringifier } = require('csv-writer');

module.exports = {
    data: {
        name: 'export-collab'
    },
    async execute(int, client) {
        await int.deferReply();
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
        const collection = client.db.collection('Collabs');
        const collab = await localFunctions.getCollab(initializedMap.get(int.user.id).collab.name, collection);

        if (collab.host !== int.user.id) {
            int.editReply('You are not allowed to do this.');
            return;
        }

        const collabParticipants = await localFunctions.getCollabParticipants(initializedMap.get(int.user.id).collab.name, collection);
        const headers = Object.keys(collabParticipants[0]);
        const csvStringifier = createObjectCsvStringifier({
            header: headers.map(header => ({ id: header, title: header }))
        });
        const csvData = csvStringifier.getHeaderString() + '\n' + csvStringifier.stringifyRecords(collabParticipants);
        const attachment = new AttachmentBuilder(Buffer.from(csvData), {
            name: `${collab.name} Data.csv`
        });

        await int.editReply({ files: [attachment] });
    }
};
