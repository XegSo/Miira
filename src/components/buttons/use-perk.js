const { perkCache } = require('../../components/selectMenus/use-perks');

module.exports = {
    data: {
        name: 'use-perk'
    },
    async execute(int) {
        const modal = perkCache.get(int.user.id).modal;
        await int.showModal(modal);
    }
};
