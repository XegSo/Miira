const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'reject-trade'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            const existingTradeRequest = await localFunctions.getTradeRequestByMessageId(int.message.id, collectionSpecial);
            const requestedUser = existingTradeRequest.requestedUser;
            const traderUser = existingTradeRequest.traderUser;
            if (requestedUser.discordId !== userId && traderUser.discordId !== userId) {
                return await int.editReply({ content: "You cannot interact with this request!", ephemeral: true });
            }
            const tradeEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Rejected Trade', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
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
            if (requestedUser.discordId === userId) {
                await int.editReply("Request denied.");
                await logChannel.send({ content: `<@${traderUser.discordId}> Your request has been denied!`});
                tradeEmbed.setDescription(`**\`\`\`ml\n🎫 Denied Request\`\`\`**                                                                                                        **${existingTradeRequest.collabName}**`)
                logChannel.messages.fetch(existingTradeRequest._id).then(msg => msg.edit({embeds: [tradeEmbed], components: [components]}));
                return await localFunctions.liquidateTradeRequest(existingTradeRequest._id, collectionSpecial);
            } 

            if (traderUser.discordId === userId) {
                await int.editReply({ content: "Request canceled.", ephemeral: true });
                tradeEmbed.setDescription(`**\`\`\`ml\n🎫 Canceled Request\`\`\`**                                                                                                        **${existingTradeRequest.collabName}**`)
                logChannel.messages.fetch(existingTradeRequest._id).then(msg => msg.edit({embeds: [tradeEmbed], components: [components]}));
                return await localFunctions.liquidateTradeRequest(existingTradeRequest._id, collectionSpecial);
            }
        } catch (e) {
            console.log(e);
        } finally {
            mongoClientSpecial.close();
        }
    }
}