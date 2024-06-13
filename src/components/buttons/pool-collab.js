const { collabCache } = require('../buttons/admin-collab');
const { adminCache } = require('../../commands/collabs/collabs');
const poolCache = new Map();

module.exports = {
    data: {
        name: 'pool-collab'
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
        int.reply('Please reply to this message with a JSON attatchment.');
        const replyMessage = await int.fetchReply();
        const collabName = initializedMap.get(int.user.id).collab;
        poolCache.set(int.user.id, {
            collab: collabName,
            userId: int.user.id,
            messageId: replyMessage.id
        });
    },
    poolCache: poolCache
};
