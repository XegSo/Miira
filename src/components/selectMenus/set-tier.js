const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { connectToMongoDB } = require('../../mongo');
const { giveTierCache } = require('../../commands/tools/givetier');

module.exports = {
    data: {
        name: 'set-tier'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const pendingUser = giveTierCache.get(int.user.id);
        console.log(pendingUser.user.tag);
        const guild = int.guild;
        const pendingMember = await guild.members.fetch(pendingUser.user.id);

        if (!pendingUser) return;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            let newPerks = [];
            let newTier = [];
            let newRoleId = '';
            const pendingTier = int.values[0];
            let currentTier = await localFunctions.getUserTier(pendingUser.user.id, collection);
            console.log(currentTier);
            if (currentTier) {
                await pendingMember.roles.remove(currentTier[0].roleId);
            }

            for (const tier of localConstants.premiumTiers) {
                for (const perk of tier.perks) {
                    newPerks.push(perk);
                    console.log(`${perk.name} has been added.`)
                }
                if (pendingTier === tier.name) {
                    newRoleId = tier.roleId;
                    break;
                }

            }

            await pendingMember.roles.add(newRoleId);
            await pendingMember.roles.add('743505566617436301');
            newTier.push({ tier: pendingTier, roleId: newRoleId });
            await localFunctions.setPerks(pendingUser.user.id, newPerks, collection);
            await localFunctions.setUserTier(pendingUser.user.id, newTier, collection);

            int.editReply(`Tier given to <@${pendingUser.user.id}>`)
            giveTierCache.delete(int.user.id);
        } finally {
            mongoClient.close();
        }
    },
};