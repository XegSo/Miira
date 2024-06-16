const { collabCache } = require('./admin-collab');
const { adminCache } = require('../../commands/admin/admin');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'edit-collab'
    },
    async execute(int, client) {
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

        if (int.user.id !== '687004886922952755') {
            await int.reply('You are not allowed to do this!');
            return;
        }

        const reply = await int.reply({
            content: 'Please reply to this message with a JSON attachment.',
            fetchReply: true
        });


        const collab = initializedMap.get(int.user.id).collab;
        const filter = (m) => m.author.id === int.user.id && m.reference.messageId === reply.id && m.attachments.size > 0;
        const collector = int.channel.createMessageCollector({ filter, time: 15_000, max: 1 });

        collector.on('collect', async (message) => {
            const attachment = message.attachments.first();

            if (!attachment.name.endsWith('.json')) {
                await message.reply('Not a json file.');
                return;
            }

            try {
                const response = await fetch(attachment.url);
                const jsonData = await response.json();
                const collabCollection = client.db.collection('Collabs');

                await localFunctions.editCollab(collab.name, jsonData, collabCollection);
                await message.reply('Collab edited succesfully.');
            } catch (err) {
                console.error(err);
                await message.reply(`Error: \`${err}\``);
            }
        });
    }
};
