const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'collab-bump'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });

        // MongoDB collections.
        const collection = client.db.collection('Collabs');
        const userCollection = client.db.collection('Users');

        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const allCollabs = await localFunctions.getCollabs(collection);
        const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
        const openMegacollab = allCollabs.find(c => c.restriction === 'megacollab' && (c.status === 'open' || c.status === 'early access' || c.status === 'on design'));

        try {
            if (typeof openMegacollab === 'undefined') {
                return int.editReply('This collab is closed!');
            }
            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) === 'undefined') {
                return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
            }
        } catch {
            return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
        }

        const collab = openMegacollab;
        const participation = collab.participants.find(u => u.discordId === userId);
        if (participation.bump_imune && int.user.id !== '687004886922952755') return int.editReply('You\'re immune to bumps! How awesome.');
        const bumps = collab.bumps;
        if (typeof bumps === 'undefined') return int.editReply('The bumps for the current megacollab have not started yet!');
        const currentBumpIndex = bumps.length - 1;
        const currentDate = Math.floor(Date.now() / 1000);
        if (typeof bumps[currentBumpIndex].users.find(u => u.discordId === userId) !== 'undefined') return int.editReply('You have already bumped!');
        let userBumps = [];
        for (const bump of bumps) {
            if (typeof bump.users.find(u => u.discordId === userId) !== 'undefined') {
                userBumps.push(bump);
            }
        }
        if (currentDate - bumps[currentBumpIndex].startingDate > bumps[currentBumpIndex].days * 24 * 60 * 60) return int.editReply(`The time window to bump has passed! Please try again on the next one. You have completed ${userBumps.length ? userBumps.length : '0'} of ${currentBumpIndex + 1} bumps.`);
        const bumpEntry = {
            discordId: userId,
            date: currentDate
        };
        if (participation.referral) {
            const referralCode = participation.referral;
            const inviterUser = await localFunctions.getUserByReferral(referralCode, userCollection);
            const logChannel = guild.channels.cache.get(localConstants.logChannelID);
            let currentBalance = inviterUser.balance;
            currentBalance = currentBalance + 2000;
            await localFunctions.setBalance(inviterUser._id, currentBalance, userCollection);
            logChannel.send({ content: `<@${inviterUser._id}> The user ${int.user.tag} has bumped their pick and you've received **2000** tokens!` });
        }
        await localFunctions.addCollabBumpUser(collab.name, collection, bumps[currentBumpIndex], bumpEntry);
        await int.editReply('You have bumped your participation succesfully');
    }
};
