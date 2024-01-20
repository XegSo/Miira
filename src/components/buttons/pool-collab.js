const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { collabCache } = require('../buttons/admin-collab');
const poolCache = new Map();

module.exports = {
    data: {
        name: 'pool-collab'
    },
    async execute(int, client) {
        if (collabCache.size === 0) {
            int.reply('Open the dashboard again. The collab hasn\'t been cached');
            return;
        }
        int.reply('Please reply to this message with a JSON attatchment.')
        const replyMessage = await int.fetchReply();
        const collabName = collabCache.get(int.user.id).collab
        poolCache.set(int.user.id, {
            collab: collabName,
            userId: int.user.id,
            messageId: replyMessage.id,
        })
    },
    poolCache: poolCache
}