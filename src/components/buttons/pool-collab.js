const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { collabCache } = require('../selectMenus/select-collab');
const poolCache = new Map();

module.exports = {
    data: {
        name: 'pool-collab'
    },
    async execute(int, client) {
       int.reply('Please reply to this message with a JSON attatchment.')
       const replyMessage = await int.fetchReply();
       const collabName = collabCache.get(int.user.id).collab
       poolCache.set(0, {
        collab: collabName,
        userId: int.user.id,
        messageId: replyMessage.id,
       })
    },
    poolCache: poolCache
}