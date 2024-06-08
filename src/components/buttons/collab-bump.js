const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'collab-bump'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;
        try {
            const allCollabs = await localFunctions.getCollabs(collection);
            const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access" || c.status === "on design"));
            try {
                if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) === "undefined") {
                    return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                }
            } catch {
                return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
            }
            const collab = openMegacollab;
            const participation = collab.participants.find(u => u.discordId === userId);
            if (participation.bump_imune) return int.editReply('You\'re imune to bumps! How awesome.');
            const bumps = collab.bumps;
            if (typeof bumps === "undefined") return int.editReply('The bumps for the current megacollab have not started yet!');
            const currentBumpIndex = bumps.length - 1;
            const currentDate = Math.floor(Date.now() / 1000);
            if (typeof bumps[currentBumpIndex].users.find(u => u.discordId === userId) !== "undefined") return int.editReply('You have already bumped!');
            let userBumps = {};
            for (const bump of bumps) {
                if (typeof bump.users.find(u => u.discordId === userId) !== "undefined") {
                    userBumps.push(bump);
                }
            }
            if (currentDate - bumps[currentBumpIndex].startingDate > bumps[currentBumpIndex].days * 24 * 60 * 60) return int.editReply(`The time window to bump has passed! Please try again on the next one. You have completed ${userBumps.length} of ${currentBumpIndex + 1} bumps.`);
            const bumpEntry = {
                discordId: userId,
                date: currentDate,
            }
            await localFunctions.addCollabBumpUser(collab.name, collection, bumps[currentBumpIndex], bumpEntry);
            await int.editReply('You have bumped your participation succesfully');
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
        }
    }
}