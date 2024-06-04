const { collabCache } = require('./admin-collab');
const { adminCache }= require('../../commands/collabs/collabs');
const editCache = new Map();

module.exports = {
    data: {
        name: 'edit-collab'
    },
    async execute(int) {
        await int.deferReply();
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
        
        if (int.user.id !== '687004886922952755') {
            await int.editReply('You are not allowed to do this!');
            return;
        }

        int.editReply('Please reply to this message with a JSON attatchment.');
        const replyMessage = await int.fetchReply();
        editCache.set(int.user.id, {
            collab: initializedMap.get(int.user.id).collab,
            userId: int.user.id,
            messageId: replyMessage.id,

        })
    },
    editCache: editCache
}