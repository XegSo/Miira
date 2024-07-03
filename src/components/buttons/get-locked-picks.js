const { collabCache } = require('./admin-collab');
const { adminCache } = require('../../commands/admin/admin');

module.exports = {
    data: {
        name: 'get-locked-picks'
    },
    async execute(int) {
        await int.deferReply({ ephemeral: true });
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

        const fullCollab = initializedMap.get(int.user.id).collab;
        let lockedPicks = '';
        for (const pick of fullCollab.pool.items) {
            if (pick.status === 'picked') {
                const assigned = fullCollab.participants.find(p => p.id === pick.id);
                if (typeof assigned === 'undefined') {
                    lockedPicks = lockedPicks.concat(' ', `${pick.id} | ${pick.name} | ${pick.series}\n`);
                }
            }
        }
        int.editReply(lockedPicks);
    }
};
