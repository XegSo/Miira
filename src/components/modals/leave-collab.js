const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { leaveCache } = require('../buttons/leave-collab');

module.exports = {
    data: {
        name: 'leave-collab'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const collection = client.db.collection('Collabs');
        const userCollection = client.db.collection('Users');
        const collectionSpecial = client.db.collection('Special');
        const userId = int.user.id;
        const guild = await client.guilds.cache.get(localConstants.guildId);
        const guildMember = await guild.members.fetch(userId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            const existingTradeRequest = await localFunctions.getTradeRequest(int.user.id, collectionSpecial);
            if (existingTradeRequest.length !== 0) {
                return await int.editReply({ content: `You cannot leave the collab when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }
            const collab = leaveCache.get(int.user.id).collab;
            const fullCollab = await localFunctions.getCollab(collab.collabName, collection);
            if (fullCollab.status === 'closed' || fullCollab.status === 'delivered' || fullCollab.status === 'completed' || collab.status === 'early delivery' || fullCollab.status === 'archived') return int.editReply('You cannot leave at this collab status...');
            if (collab.collabPick.name !== int.fields.getTextInputValue('pick')) {
                return int.editReply('Wrong name, make sure you didn\'t make a typo!');
            }
            if (fullCollab.type === 'pooled') {
                let pick = collab.collabPick;
                let pool = fullCollab.pool.items;
                const itemInPool = pool.find((e) => e.id === pick.id);

                const userPerks = await localFunctions.getCollabPerksOfUser(collab.collabName, collection, userId);
                if (typeof userPerks !== 'undefined') {
                    for (const perk of userPerks) {
                        await localFunctions.liquidatePerkEntry(userId, collab.collabName, perk.perk, collection);
                    }
                }

                let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                await localFunctions.unsetCollabParticipation(collab.collabName, collection, pick.id);
                userCollabs = userCollabs.filter(e => e.collabName !== collab.collabName);
                await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                await localFunctions.removeCollabParticipant(collab.collabName, collection, userId);

                let contentString = '';
                const snipes = await localFunctions.getCollabSnipes(collab.collabName, collection, pick.id);
                if (typeof snipes !== 'undefined') {
                    if (typeof snipes.find(p => p.pick === pick.id) !== 'undefined') {
                        contentString = 'Snipers! ';
                    }
                    for (const snipe of snipes) {
                        contentString = contentString.concat('', `<@${snipe.userId}>`);
                        await localFunctions.removeCollabSnipe(collab.collabName, collection, snipe.userId);
                    }
                }

                const leaveEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                    .setDescription(`**\`\`\`ml\n🎫 New Character Available!\`\`\`**                                                                                                        **${fullCollab.name}**\nName:${pick.name}\nID: ${pick.id}`);

                const embed2 = new EmbedBuilder()
                    .setImage(pick.imgURL)
                    .setURL('https://endlessmirage.net/');
                logChannel.send({ content: contentString, embeds: [leaveEmbed, embed2] });
                await int.editReply('You\'ve left the collab succesfully.');

                while (true) {
                    try {
                        await localFunctions.unsetParticipationOnSheet(fullCollab, itemInPool);
                        console.log('Parcitipation unset');
                        break;
                    } catch {
                        console.log('Sheet update failed, retring in 2 minutes...');
                        await localFunctions.delay(2 * 60 * 1000);
                    }
                }

                if (fullCollab.status === 'full') {
                    await localFunctions.setCollabStatus(fullCollab.name, 'open', collection);
                }

                await guildMember.roles.remove(fullCollab.roleId);
            }
        } catch (e) {
            console.log(e);
        }
    }
};
