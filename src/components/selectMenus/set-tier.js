const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { giveTierCache } = require('../../commands/admin/admin');
module.exports = {
    data: {
        name: 'set-tier'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const pendingUser = giveTierCache.get(int.user.id);
        const guild = int.guild;
        const pendingMember = await guild.members.fetch(pendingUser.user.id);

        if (!pendingUser) return;
        const collection = client.db.collection('Users');

        let newPerks = [];
        let newRoleId = '';
        const pendingTier = int.values[0];
        let currentTier = await localFunctions.getUserTier(pendingUser.user.id, collection);
        if (currentTier) {
            await pendingMember.roles.remove(currentTier.id);
        }

        for (const tier of localConstants.premiumTiers) {
            for (const perk of tier.perks) {
                newPerks.push(perk);
                console.log(`${perk.name} has been added.`);
            }
            if (pendingTier === tier.name) {
                newRoleId = tier.roleId;
                break;
            }

        }

        await pendingMember.roles.add(newRoleId);
        await pendingMember.roles.add('743505566617436301');
        await localFunctions.setPerks(pendingUser.user.id, newPerks, collection);
        await localFunctions.setUserTier(pendingUser.user.id, { name: pendingTier, id: newRoleId }, collection);

        await int.editReply(`Tier given to <@${pendingUser.user.id}>`);
        giveTierCache.delete(int.user.id);
    }
};
