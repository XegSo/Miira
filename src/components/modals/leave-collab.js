const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { leaveCache } = require('../buttons/leave-collab');

module.exports = {
    data: {
        name: "leave-collab"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            const collab = leaveCache.get(int.user.id).collab;
            const fullCollab = await localFunctions.getCollab(collab.collabName, collection);
            if (collab.collabPick.name !== int.fields.getTextInputValue('pick')) {
                return await int.editReply('Wrong name, make sure you didn\'t make a typo!');
            }
            if (fullCollab.type === "pooled") {
                let pick = collab.collabPick;
                let pool = fullCollab.pool.items;
                const itemInPool = pool.find((e) => e.id === pick.id);
                let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                await localFunctions.unsetCollabParticipation(collab.collabName, collection, pick.id);
                userCollabs = userCollabs.filter(e => e.collabName !== collab.collabName);
                await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                await localFunctions.removeCollabParticipant(collab.collabName, collection, userId);
                const leaveEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                    .setDescription(`**\`\`\`ml\n🎫 New Character Available!\`\`\`**                                                                                                        **${fullCollab.name}**\nName:${pick.name}\nID: ${pick.id}`)

                const embed2 = new EmbedBuilder()
                    .setImage(pick.imgURL)
                    .setURL('https://endlessmirage.net/')
                logChannel.send({ embeds: [leaveEmbed, embed2] });

                await localFunctions.unsetParticipationOnSheet(fullCollab, itemInPool);

                if (fullCollab.status === "full") {
                    await localFunctions.setCollabStatus(fullCollab.name, "open", collection);
                }

                await int.editReply("You've left the collab succesfully.");
            }
        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
        }
    },
};