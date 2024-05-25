const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'accept-trade'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            const existingTradeRequest = await localFunctions.getTradeRequestByMessageId(int.message.id, collectionSpecial);
            const requestedUser = existingTradeRequest.requestedUser;
            const traderUser = existingTradeRequest.traderUser;
            if (requestedUser.discordId !== userId && traderUser.discordId !== userId) {
                return await int.editReply({ content: "You cannot interact with this request!", ephemeral: true });
            }
            if (traderUser.discordId === userId) {
                return await int.editReply({ content: "You cannot accept the request you proposed. The owner of the pick you requested has to accept it in order to proceed.", ephemeral: true });
            }
            if (requestedUser.discordId === userId) {
                const collab = await localFunctions.getCollab(existingTradeRequest.collabName, collection);

                if(collab.type === "pooled") {
                    let pool = collab.pool.items;
                    //getting and assigning new pick to trader
                    const newTraderPick = pool.find((e) => e.id === requestedUser.id);
                    const newRequestedUserPick = pool.find((e) => e.id === traderUser.id);
                    const traderOsuDataFull = await localFunctions.getOsuData(traderUser.discordId, userCollection);
                    const requestedUserOsuDataFull = await localFunctions.getOsuData(requestedUser.discordId, userCollection);

                    await localFunctions.editCollabParticipantPickOnCollab(collab.name, traderUser.discordId, newTraderPick, collection);
                    await localFunctions.editCollabParticipantPickOnUser(traderUser.discordId, collab.name, newTraderPick, userCollection);
                    await localFunctions.editCollabParticipantPickOnCollab(collab.name, requestedUser.discordId, newRequestedUserPick, collection);
                    await localFunctions.editCollabParticipantPickOnUser(requestedUser.discordId, collab.name, newRequestedUserPick, userCollection);
        
                    console.log('A trade has been completed.');

                    const tradeEmbed = new EmbedBuilder()
                        .setFooter({ text: 'Endless Mirage | Accepted Trade', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                        .setColor('#f26e6a')
                        .addFields(
                            {
                                name: "‎",
                                value: "**\`\`\`ml\n- Pick 1\`\`\`**",
                                inline: true
                            },
                            {
                                name: "‎",
                                value: `┌ Pick ID: **${requestedUser.id}**\n└ Name: **${requestedUser.name}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            },
                            {
                                name: "‎",
                                value: "**\`\`\`js\n+ Pick 2\`\`\`**",
                                inline: true
                            },
                            {
                                name: "‎",
                                value: `┌ Pick ID: **${traderUser.id}**\n└ Name: **${traderUser.name}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            }
                        )
    
                    const components = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('accept-trade')
                            .setLabel('Accept')
                            .setStyle('Success')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('reject-trade')
                            .setLabel('Reject')
                            .setStyle('Danger')
                            .setDisabled(true),
                    );
                    await int.editReply("Request acepted!");
                    await logChannel.send({ content: `<@${traderUser.discordId}> Your request has been accepted!`});
                    tradeEmbed.setDescription(`**\`\`\`js\n🎫 Accepted Request\`\`\`**                                                                                                        **${existingTradeRequest.collabName}**`)
                    logChannel.messages.fetch(existingTradeRequest._id).then(msg => msg.edit({embeds: [tradeEmbed], components: [components]}));
                    await localFunctions.liquidateTradeRequest(existingTradeRequest._id, collectionSpecial);

                    while (true) {
                        try {
                            await localFunctions.unsetParticipationOnSheet(collab, newTraderPick);
                            console.log('Parcitipation unset');
                            break;
                        } catch {
                            console.log('Sheet update failed, retring in 2 minutes...');
                            await localFunctions.delay(2*60*1000);
                        }
                    }
                    while (true) {
                        try {
                            await localFunctions.setParticipationOnSheet(collab, newTraderPick, traderOsuDataFull.username);
                            console.log('New pick set!');
                            break;
                        } catch {
                            console.log('Sheet update failed, retring in 2 minutes...');
                            await localFunctions.delay(2*60*1000);
                        }
                    }
                    while (true) {
                        try {
                            await localFunctions.unsetParticipationOnSheet(collab, newRequestedUserPick);
                            console.log('Parcitipation unset');
                            break;
                        } catch {
                            console.log('Sheet update failed, retring in 2 minutes...');
                            await localFunctions.delay(2*60*1000);
                        }
                    }
                    while (true) {
                        try {
                            await localFunctions.setParticipationOnSheet(collab, newRequestedUserPick, requestedUserOsuDataFull.username);
                            console.log('New pick set!');
                            break;
                        } catch {
                            console.log('Sheet update failed, retring in 2 minutes...');
                            await localFunctions.delay(2*60*1000);
                        }
                    }
                }
            } 

        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
            mongoClientSpecial.close();
        }
    }
}