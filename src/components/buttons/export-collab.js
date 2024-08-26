const localFunctions = require('../../functions');
const { AttachmentBuilder } = require('discord.js');
const { collabCache } = require('./admin-collab');
const { adminCache } = require('../../commands/admin/admin');

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

        const collabParticipants = collab.participants;
        const bumps = collab.bumps;
        for (const participant of collabParticipants) {
            let completedBumps = 0;
            for (const bump of bumps) {
                if (typeof bump.users.find(u => u.discordId === participant.discordId) !== 'undefined') {
                    completedBumps++;
                }
            }
            if (participant.bump_imune) {
                completedBumps = 4;
            }
            participant.completedBumps = completedBumps;
        }
        const toExport = {
            'Participants': collabParticipants
        };

        const excelBuffer = localFunctions.createExcelBuffer(toExport);

        const attachment = new AttachmentBuilder(excelBuffer, {
            name: `${collab.name} Data.xlsx`
        });

        await int.editReply({ files: [attachment] });
    }
};
