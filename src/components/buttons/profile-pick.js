const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { v2, tools } = require('osu-api-extended');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { buttonCache } = require('../selectMenus/select-collab');
const profileButtonCache = new Map();

module.exports = {
    data: {
        name: 'profile-pick'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        try {
            const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            const userCollab = userCollabs.find(e => e.collabName === buttonCache.get(userId).collab);
            let fullCollab = await localFunctions.getCollab(buttonCache.get(userId).collab, collection);
            let pick = userCollab.collabPick;
            let components = [];
            const dashboardEmbed = new EmbedBuilder()
                .setFooter({ text: `Endless Mirage | Collab Profile`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setDescription(`**\`\`\`\n🏐 ${userCollab.collabName}\`\`\`**\n**Joined <t:${userCollab.joinDate}:R>**`)
                .addFields(
                    {
                        name: `‎`,
                        value: `┌ Pick: ${pick.name}\n└ ID: ${pick.id}`,
                        inline: true
                    },
                    {
                        name: `‎`,
                        value: `┌ Series: ${pick.series}\n└ Category: ${pick.category}`,
                        inline: true
                    },
                    {
                        name: `‎`,
                        value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>`,
                    },
                    {
                        name: `‎`,
                        value: `┌ Avatar Text: **${userCollab.av_text}**\n├ Card Text: **${userCollab.ca_text}**\n└ Card Quote: **${userCollab.ca_quote ? userCollab.ca_quote : "None"}**`,
                    },
                    {
                        name: `‎`,
                        value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>`,
                    }
                )
                .setImage(pick.imgURL)


            components = new ActionRowBuilder();

            switch (fullCollab.status) {
                case "early delivery":
                    const userTier = await localFunctions.getTier(userId, userCollection);
                    let tier = 0;
                    if (!userTier && guildMember.roles.cache.has('743505566617436301') && !guildMember.roles.cache.has('1150484454071091280')) {
                        let premiumDetails = await localFunctions.assignPremium(int, userId, collection, guildMember);
                        tier = localFunctions.premiumToInteger(premiumDetails[0].name);
                    } else {
                        tier = localFunctions.premiumToInteger(userTier.name);
                    }
                    if (tier >= 4) {
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('download-collab')
                                .setLabel('⬇️ Download')
                                .setStyle('Primary'),
                        )
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('update-mats')
                                .setLabel('💹 Update')
                                .setStyle('Primary'),
                        )
                    }
                    break;
                case "delivered":
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('download-collab')
                            .setLabel('⬇️ Download')
                            .setStyle('Primary'),
                    )
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('update-mats')
                            .setLabel('💹 Update')
                            .setStyle('Primary'),
                    )
                    break;
                case "completed":
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('download-collab')
                            .setLabel('⬇️ Download')
                            .setStyle('Primary'),
                    )
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('update-mats')
                            .setLabel('💹 Update')
                            .setStyle('Primary'),
                    )
                    break;
                case "archived":
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('download-collab')
                            .setLabel('⬇️ Download')
                            .setStyle('Primary'),
                    )
                default:
                    if (fullCollab.status !== "full") {
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('change-pick')
                                .setLabel('🔁 Swap')
                                .setStyle('Primary'),
                        )
                    }
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('swap-pick')
                            .setLabel('🔀 Trade')
                            .setStyle('Primary'),
                    )
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('change-texts')
                            .setLabel('📝 Edit')
                            .setStyle('Primary'),
                    )
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('leave-collab')
                            .setLabel('🛫 Leave')
                            .setStyle('Danger'),
                    )
            }


            profileButtonCache.set(int.user.id, {
                collab: buttonCache.get(userId).collab,
            })

            await int.editReply({
                content: '',
                embeds: [dashboardEmbed],
                components: [components],
            });
        } catch (e) {
            console.log(e)
            await int.editReply('Something went wrong...')
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
        }
    },
    profileButtonCache: profileButtonCache
};