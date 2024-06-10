const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { v2, tools } = require('osu-api-extended');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { parse } = require('dotenv');
const createCollabCache = new Map();
const claimCache = new Map();
const userCheckCache = new Map();
const adminCache = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collabs')
        .setDescription('Collabs dashboard')
        .addSubcommand((subcommand) => subcommand.setName("join").setDescription('Join a collab!'))
        .addSubcommand((subcommand) => subcommand.setName("manage").setDescription('Manage your collab participations.'))
        .addSubcommand((subcommand) => subcommand.setName("info").setDescription('View all info about the collabs hosted since 2024.'))
        .addSubcommand((subcommand) => subcommand.setName("profile").setDescription('Manage your collab profile.'))
        .addSubcommand((subcommand) => subcommand.setName("create").setDescription('Create a collab.'))
        .addSubcommand((subcommand) => subcommand.setName("link").setDescription('Link your osu! account.'))
        .addSubcommand((subcommand) => subcommand.setName("premium").setDescription('All regarding premium status.'))
        .addSubcommand((subcommand) => subcommand.setName("perks").setDescription('Manage your megacollab perks.'))
        .addSubcommand((subcommand) => subcommand.setName("feedback").setDescription('Send a feedback comment for the staff.'))
        .addSubcommand((subcommand) => subcommand.setName("referral").setDescription('Obtain and share your referral code.'))
        .addSubcommandGroup((subcommandGroup) =>
            subcommandGroup
                .setName('quick')
                .setDescription('Quick actions for the megacollabs.')
                .addSubcommand((subcommand) =>
                    subcommand.setName("join")
                        .setDescription('Join a collab in a quick way. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('pick')
                                .setDescription('Pick name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                        .addStringOption(option =>
                            option.setName('avatar_text')
                                .setDescription('Text for the avatar')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('banner_text')
                                .setDescription('Text for the banner')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('banner_quote')
                                .setDescription('Quote for the banner')
                        )
                        .addStringOption(option =>
                            option.setName('referral')
                                .setDescription('Referral code')
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("join-random")
                        .setDescription('Join a collab in a quick way, with a random pick. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('avatar_text')
                                .setDescription('Text for the avatar')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('banner_text')
                                .setDescription('Text for the banner')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('banner_quote')
                                .setDescription('Quote for the banner')
                        )
                        .addStringOption(option =>
                            option.setName('referral')
                                .setDescription('Referral code')
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("swap")
                        .setDescription('Swap your pick in a quick way. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('pick')
                                .setDescription('New pick name')
                                .setRequired(true)
                                .setAutocomplete(true)

                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("bump")
                        .setDescription('Bump your current megacollab participation.')
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("trade")
                        .setDescription('Trade a pick in a quick way. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('pick')
                                .setDescription('Trade pick name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("pick-check")
                        .setDescription('Check a character status. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('pick')
                                .setDescription('Pick name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("user-check")
                        .setDescription('Check the participation of an user. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('user')
                                .setDescription('Discord username')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("snipe")
                        .setDescription('Get a notification if a pick gets available. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('pick')
                                .setDescription('Pick name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        )
        .addSubcommandGroup((subcommandGroup) =>
            subcommandGroup
                .setName('admin')
                .setDescription('Admin commands.')
                .addSubcommand((subcommand) =>
                    subcommand.setName("manage")
                        .setDescription('Open the collabs Admin Collabs Dashboard. (Admin only)')
                        .addStringOption(option =>
                            option.setName('collab')
                                .setDescription('Collab name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("set-bumps")
                        .setDescription('Setup bumps for megacollabs. (Admin only)')
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("link")
                        .setDescription('Links an account instantly. (Admin only)')
                        .addStringOption(option =>
                            option.setName('discordid')
                                .setDescription('User discord id')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('osuid')
                                .setDescription('User osu id')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('gamemode')
                                .setDescription('osu! main gamemode')
                                .setRequired(true)
                                .addChoices(
                                    { name: 'osu', value: 'osu' },
                                    { name: 'mania', value: 'mania' },
                                    { name: 'fruits', value: 'fruits' },
                                    { name: 'taiko', value: 'taiko' },
                                )
                        )
                )
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const subcommand = int.options.getSubcommand();
        const subcommandGroup = int.options.getSubcommandGroup();
        const userId = int.user.id;
        const guild = await client.guilds.cache.get(localConstants.guildId);
        const guildMember = await guild.members.cache.get(userId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        if (subcommand === "create") {
            if (userId !== '687004886922952755') {
                await int.editReply('You are not allowed to do this!');
                return;
            }
            int.editReply('Please reply to this message with a JSON attatchment.');
            const replyMessage = await int.fetchReply();
            createCollabCache.set(int.user.id, {
                userId: int.user.id,
                messageId: replyMessage.id,
            })
        }

        if (subcommand === "feedback") {
            await int.editReply('This command is WIP!');
            return;
        }

        if (subcommand === "link") {
            const components = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('link-osu')
                    .setLabel('🔗 Link your osu! Account')
                    .setStyle('Success'),
            )
            return int.editReply({
                content: 'Link your account using the button bellow.',
                components: [components]
            });
        }

        if (subcommand === "referral") {
            localFunctions.handleReferralCommand(int)
                .then(async (code) => {
                    const cartEmbed = new EmbedBuilder()
                        .setFooter({ text: 'Endless Mirage | Referral Code', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                        .setColor('#f26e6a')
                        .setTitle(`Your current referral code is:`)
                        .setDescription(`**\`\`\`prolog\n${code}\`\`\`**                                                                                                        \nEverytime a friend you invited to the collab bumps their pick, you will get **2000 tokens**!\nIssue the command \`\`/server shop\`\` to see all you can buy, and the command \`\`/server profile\`\` to check the amount of tokens you have.`)
                        .addFields(
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            }
                        )
                    const components = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('see-referrals')
                            .setLabel('❄️ Referred users')
                            .setStyle('Success'),
                    )
                    await int.editReply({ embeds: [cartEmbed], components: [components] });
                })
                .catch((error) => {
                    console.error('Error handling referral command:', error);
                    int.editReply({ content: 'An error occurred while generating your referral code.', ephemeral: true });
                });
            return;
        }

        if (subcommand === "profile") {
            const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
            const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
            try {
                const userOsu = await localFunctions.getOsuData(userId, collection);
                const lastUpdate = await localFunctions.getUserLastUpdate(userId, collection);
                const currentDate = Math.floor(Date.now() / 1000);
                if (!userOsu) {
                    const components = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('link-osu')
                            .setLabel('🔗 Link your osu! Account')
                            .setStyle('Success'),
                    )
                    await int.editReply({
                        content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                        components: [components]
                    });
                    return;
                }
                const collabData = await localFunctions.getUserCollabs(userId, collection);
                const collabs = await localFunctions.getCollabs(collabCollection);
                let buttons;

                let tier = 0;
                let prestigeLevel = 0;
                let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                if (typeof prestige !== "undefined") {
                    prestige = prestige.name

                    prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                }
                const userTier = await localFunctions.getUserTier(userId, collection);
                if (userTier) {
                    tier = localFunctions.premiumToInteger(userTier.name);
                } else if (guildMember.roles.cache.has('743505566617436301')) {
                    let premiumDetails = await localFunctions.assignPremium(userId, collection, guildMember);
                    tier = localFunctions.premiumToInteger(premiumDetails[0].name);
                }

                const osuEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Collabs Profile', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setThumbnail(userOsu.avatar_url)
                    .addFields(
                        {
                            name: "‎",
                            value: `┌ Username: **${userOsu.username}**\n├ Country: **${tools.country(userOsu.country_code)}**\n├ Rank: **${userOsu.statistics.global_rank ? userOsu.statistics.global_rank : "Unranked"}**\n├ Peak Rank: **${userOsu.rank_highest.rank}**\n└ Level: **${userOsu.statistics.level.current}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Performance: **${userOsu.statistics.pp}pp**\n├ Join date: **<t:${new Date(userOsu.join_date).getTime() / 1000}:R>**\n├ Prestige Level: **${prestigeLevel}**\n├ Premium Tier: **${tier}**\n└ Playtime: **${Math.floor(userOsu.statistics.play_time / 3600)}h**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        },
                    )
                if (typeof userOsu.skillRanks !== 'undefined') {
                    osuEmbed.addFields(
                        {
                            name: "‎",
                            value: `┌ ACC: **${userOsu.skillRanks[0].rank}** | Score: **${userOsu.skillRanks[0].int}**\n├ REA: **${userOsu.skillRanks[1].rank}** | Score: **${userOsu.skillRanks[1].int}**\n├ ${userOsu.skillRanks[2].skill === "Aim" ? "AIM" : "CON"}: **${userOsu.skillRanks[2].rank}** | Score: **${userOsu.skillRanks[2].int}**\n├ SPD: **${userOsu.skillRanks[3].rank}** | Score: **${userOsu.skillRanks[3].int}**\n├ STA: **${userOsu.skillRanks[4].rank}** | Score: **${userOsu.skillRanks[4].int}**\n└ PRE: **${userOsu.skillRanks[5].rank}** | Score: **${userOsu.skillRanks[5].int}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Top 1 Mod: **${userOsu.modsData.top4Mods[0].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[0].percentage) ? Math.round(userOsu.modsData.top4Mods[0].percentage) : userOsu.modsData.top4Mods[0].percentage}%**\n├ Top 2 Mod: **${userOsu.modsData.top4Mods[1].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[1].percentage) ? Math.round(userOsu.modsData.top4Mods[1].percentage) : userOsu.modsData.top4Mods[1].percentage}%**\n├ Top 3 Mod: **${userOsu.modsData.top4Mods[2].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[2].percentage) ? Math.round(userOsu.modsData.top4Mods[2].percentage) : userOsu.modsData.top4Mods[2].percentage}%**\n├ Top 4 Mod: **${userOsu.modsData.top4Mods[3].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[3].percentage) ? Math.round(userOsu.modsData.top4Mods[3].percentage) : userOsu.modsData.top4Mods[3].percentage}%**\n└ Most used combination: **${userOsu.modsData.mostCommonModCombination.combination}**`,
                            inline: true
                        }
                    )
                }
                if (!lastUpdate || (currentDate - lastUpdate) > 604800) {
                    buttons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('🔄 Update your data')
                            .setCustomId('refresh-osu-data')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setLabel('🔄 Change your gamemode')
                            .setCustomId('change-osu-mode')
                            .setStyle('Primary')
                    )
                    osuEmbed.addFields(
                        {
                            name: "*You are able to update your analytics.*",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )
                } else {
                    buttons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('🔄 Update your data')
                            .setCustomId('refresh-osu-data')
                            .setStyle('Primary')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setLabel('🔄 Change your gamemode')
                            .setCustomId('change-osu-mode')
                            .setStyle('Primary')
                            .setDisabled(true)
                    )
                    osuEmbed.addFields(
                        {
                            name: `*You can update your analytics <t:${Math.floor(lastUpdate + 604800)}:R>.*`,
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )
                }

                const userPerks = await localFunctions.getPerks(userId, collection);
                let collabsToJoinCount = 0;
                const joinMenu = new SelectMenuBuilder()
                    .setCustomId('select-collab')
                    .setPlaceholder('Select a collab to join.')
                const deluxeEntry = await localFunctions.getDeluxeEntry(userId, collection);
                for (const collab of collabs) {
                    if (((collab.status !== "closed" && collab.status !== "on design")) && typeof collabData.find(e => e.collabName === collab.name) === "undefined") {
                        switch (collab.restriction) {
                            case "staff":
                                if (guildMember.roles.cache.has('961891383365500938') || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    collabsToJoinCount++;
                                }
                                break;
                            case "deluxe":
                                if (deluxeEntry || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    collabsToJoinCount++;
                                }
                                break;
                            case "megacollab":
                                if ((collab.status === "early access" && typeof userPerks.find(e => e.name === "Megacollab Early Access")) || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    collabsToJoinCount++;
                                }
                                break;
                            case "prestige":
                                if (typeof prestige !== "undefined" || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    collabsToJoinCount++;
                                }
                                break;
                            case "experimental":
                                if (tier > 0 || prestigeLevel >= 4 || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    collabsToJoinCount++;
                                }
                                break;
                            case "none":
                                joinMenu.addOptions({ label: collab.name, value: collab.name });
                                collabsToJoinCount++;
                                break;
                        }
                    }
                }
                const joinMenuRow = new ActionRowBuilder().addComponents(joinMenu);
                if (collabData.length === 0) {
                    if (collabsToJoinCount === 0) {
                        osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Seems like you haven't joined any collab yet...*\n*Unfortunately, there isn't any collabs you can join at the moment.*`)
                        await int.editReply({
                            content: '',
                            embeds: [osuEmbed],
                            components: [buttons]
                        })
                    } else {
                        osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Seems like you haven't joined any collab yet...*\n`)
                        await int.editReply({
                            content: '',
                            embeds: [osuEmbed],
                            components: [buttons, joinMenuRow]
                        })
                    }
                } else {
                    const manageMenu = new SelectMenuBuilder()
                        .setCustomId('manage-collab')
                        .setPlaceholder('Select a collab to manage.')
                    for (let currentCollab of collabData) {
                        manageMenu.addOptions({ label: currentCollab.collabName, value: currentCollab.collabName });
                    }
                    const manageMenuRow = new ActionRowBuilder().addComponents(manageMenu);
                    if (collabsToJoinCount === 0) {
                        osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *You are participating in a collab!*`);
                        await int.editReply({
                            content: '',
                            embeds: [osuEmbed],
                            components: [buttons, manageMenuRow]
                        })
                    } else {
                        osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Seems like you can join to some collab(s)!*`);
                        await int.editReply({
                            content: '',
                            embeds: [osuEmbed],
                            components: [buttons, manageMenuRow, joinMenuRow]
                        })
                    }
                }
            } finally {
                mongoClient.close();
                mongoClientCollabs.close();
            }
            return;
        }

        if (subcommand === "manage" && subcommandGroup !== "admin") {
            const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
            const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
            try {
                const userOsu = await localFunctions.getOsuData(userId, collection);
                if (!userOsu) {
                    const components = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('link-osu')
                            .setLabel('🔗 Link your osu! Account')
                            .setStyle('Success'),
                    )
                    await int.editReply({
                        content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                        components: [components]
                    });
                    return;
                }
                const collabData = await localFunctions.getUserCollabs(userId, collection);

                const osuEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Manage Collabs', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setThumbnail(userOsu.avatar_url)

                const manageMenu = new SelectMenuBuilder()
                    .setCustomId('manage-collab')
                    .setPlaceholder('Select a collab to manage.')

                let fullCollab;
                for (const currentCollab of collabData) {
                    fullCollab = await localFunctions.getCollab(currentCollab.collabName, collabCollection);
                    manageMenu.addOptions({ label: currentCollab.collabName, value: currentCollab.collabName });
                    osuEmbed.addFields(
                        {
                            name: `${currentCollab.collabName}`,
                            value: `┌ Pick ID: ${currentCollab.collabPick.id}\n├ Pick Name: ${currentCollab.collabPick.name}\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${fullCollab.spreadsheetID})**__`
                        }
                    )
                }
                const manageMenuRow = new ActionRowBuilder().addComponents(manageMenu);
                osuEmbed.addFields(
                    {
                        name: "‎",
                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                    },
                );


                if (collabData.length !== 0) {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Manage your past and present participations in this dashboard.*`)
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed],
                        components: [manageMenuRow]
                    })
                } else {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Seems like you haven't participated in a collab since the creation of this system...*`)
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed]
                    })
                }

            } finally {
                mongoClient.close();
                mongoClientCollabs.close();
            }
            return;
        }

        if (subcommand === "join" && subcommandGroup !== "quick") {
            const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
            const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
            try {
                const userOsu = await localFunctions.getOsuData(userId, collection);
                if (!userOsu) {
                    const components = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('link-osu')
                            .setLabel('🔗 Link your osu! Account')
                            .setStyle('Success'),
                    )
                    await int.editReply({
                        content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                        components: [components]
                    });
                    return;
                }
                const collabData = await localFunctions.getUserCollabs(userId, collection);
                let collabs = await localFunctions.getCollabs(collabCollection);

                let tier = 0;
                let prestigeLevel = 0;
                let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                if (typeof prestige !== "undefined") {
                    prestige = prestige.name

                    prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                }
                const userTier = await localFunctions.getUserTier(userId, collection);
                if (userTier) {
                    tier = localFunctions.premiumToInteger(userTier.name);
                } else if (guildMember.roles.cache.has('743505566617436301')) {
                    let premiumDetails = await localFunctions.assignPremium(userId, collection, guildMember);
                    tier = localFunctions.premiumToInteger(premiumDetails[0].name);
                }


                const osuEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Join a Collab', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setThumbnail(userOsu.avatar_url)

                const userPerks = await localFunctions.getPerks(userId, collection);
                let collabsToJoinCount = 0;
                const joinMenu = new SelectMenuBuilder()
                    .setCustomId('select-collab')
                    .setPlaceholder('Select a collab to join.')
                const deluxeEntry = await localFunctions.getDeluxeEntry(userId, collection);
                for (const collab of collabs) {
                    let user_cap = collab.user_cap;
                    let participants = collabs.participants ? collabs.participants.length : 0;
                    let slots = user_cap - participants;
                    if ((((collab.status !== "closed" && collab.status !== "on design" && collab.status !== "full")) && typeof collabData.find(e => e.collabName === collab.name) === "undefined") || userId === '687004886922952755') {
                        switch (collab.restriction) {
                            case "staff":
                                if (guildMember.roles.cache.has('961891383365500938') || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    osuEmbed.addFields(
                                        {
                                            name: `${collab.name}`,
                                            value: `┌ Slots available: ${slots}\n├ Closing date: <t:${parseInt(collab.closure)}:R>\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})**__`
                                        }
                                    )
                                    collabsToJoinCount++;
                                }
                                break;
                            case "deluxe":
                                if (deluxeEntry || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    osuEmbed.addFields(
                                        {
                                            name: `${collab.name}`,
                                            value: `┌ Slots available: ${slots}\n├ Closing date: <t:${parseInt(collab.closure)}:R>\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})**__`
                                        }
                                    )
                                    collabsToJoinCount++;
                                }
                                break;
                            case "megacollab":
                                if ((collab.status === "early access" && typeof userPerks.find(e => e.name === "Megacollab Early Access")) || guildMember.roles.cache.has('630636502187114496')/*admin*/ || guildMember.roles.cache.has('834962043735638016')/*special donator*/ || guildMember.roles.cache.has('962251481669574666')/*contributor*/) {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    osuEmbed.addFields(
                                        {
                                            name: `${collab.name}`,
                                            value: `┌ Slots available: ${slots}\n├ Closing date: <t:${parseInt(collab.closure)}:R>\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})**__`
                                        }
                                    )
                                    collabsToJoinCount++;
                                } else if (collab.status === "open") {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    osuEmbed.addFields(
                                        {
                                            name: `${collab.name}`,
                                            value: `┌ Slots available: ${slots}\n├ Closing date: <t:${parseInt(collab.closure)}:R>\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})**__`
                                        }
                                    )
                                    collabsToJoinCount++;
                                }
                                break;
                            case "prestige":
                                if (typeof prestige !== "undefined" || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    osuEmbed.addFields(
                                        {
                                            name: `${collab.name}`,
                                            value: `┌ Slots available: ${slots}\n├ Closing date: <t:${parseInt(collab.closure)}:R>\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})**__`
                                        }
                                    )
                                    collabsToJoinCount++;
                                }
                                break;
                            case "experimental":
                                if (tier > 0 || prestigeLevel >= 4 || userId === '687004886922952755') {
                                    joinMenu.addOptions({ label: collab.name, value: collab.name });
                                    osuEmbed.addFields(
                                        {
                                            name: `${collab.name}`,
                                            value: `┌ Slots available: ${slots}\n├ Closing date: <t:${parseInt(collab.closure)}:R>\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})**__`
                                        }
                                    )
                                    collabsToJoinCount++;
                                }
                                break;
                            case "none":
                                joinMenu.addOptions({ label: collab.name, value: collab.name });
                                osuEmbed.addFields(
                                    {
                                        name: `${collab.name}`,
                                        value: `┌ Slots available: ${slots}\n├ Closing date: <t:${parseInt(collab.closure)}:R>\n└ __**[Check the spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})**__`
                                    }
                                )
                                collabsToJoinCount++;
                                break;
                        }
                    }
                }
                osuEmbed.addFields(
                    {
                        name: "‎",
                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                    },
                );
                const joinMenuRow = new ActionRowBuilder().addComponents(joinMenu);
                if (collabsToJoinCount === 0) {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Unfortunately, there isn't any collabs you can join at the moment.*`);
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed],
                    })
                } else {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Looks like you can join some collabs!*`);
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed],
                        components: [joinMenuRow]
                    })
                }
            } finally {
                mongoClient.close();
                mongoClientCollabs.close();
            }
            return;
        }

        if (subcommand === "info") {
            const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
            try {
                const dashboardEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription("**\`\`\`\n🏐 Collabs Dashboard\`\`\`**")
                    .addFields(
                        {
                            name: "In this section, you can check information about all the collabs that have been hosted since 2024.",
                            value: "Use the select menu to visualize a collab.\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    );
                const collabsMenu = new SelectMenuBuilder()
                    .setCustomId('select-collab')
                    .setPlaceholder('Select a collab to visualize.')
                const allCollabs = await localFunctions.getCollabs(collection);
                for (let collab of allCollabs) {
                    collabsMenu.addOptions({ label: collab.name, value: collab.name });
                }
                const actionRow = new ActionRowBuilder().addComponents(collabsMenu);
                await int.editReply({
                    content: '',
                    embeds: [dashboardEmbed],
                    components: [actionRow],
                })
            } catch (e) {
                console.log(e);
                await int.editReply('Something went wrong...')
            } finally {
                mongoClient.close();
            }
            return;
        }

        if (subcommand === "perks") {
            const perksEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Perks Dashboard\n', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setAuthor({ name: `Welcome to your perks dashboard ${int.user.tag}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
            const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
            const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
            try {
                let userPerks = await localFunctions.getPerks(userId, userCollection);
                let submittedPerks = await localFunctions.getUserPerksAllCollabs(collabCollection, userId);
                const component = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('perks-buy')
                        .setLabel('🔀 Shop')
                        .setStyle('Primary'),
                )
                if (submittedPerks.length === 0 && userPerks.length !== 0) {
                    let useMenu = new SelectMenuBuilder()
                        .setCustomId('use-perks')
                        .setPlaceholder('Use your perks.')
                    for (const perk of userPerks) {
                        useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                    }
                    perksEmbed.setDescription(`*Seems like you can use some perks!*\n                                                                                                        **\`\`\`ml\n✅ To use one of your perks, use the menu bellow!\`\`\`**`);
                    perksEmbed.addFields(
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )
                    const useComponent = new ActionRowBuilder().addComponents(useMenu);
                    await int.editReply({
                        content: '',
                        embeds: [perksEmbed],
                        components: [useComponent, component],
                    });
                } else if (submittedPerks.length === 0 && userPerks.length === 0) {
                    perksEmbed.setDescription(`*Seems like you don't have any perk to use...*\n                                                                                                        **\`\`\`ml\n❔ Interested on buying some perk for the megacollabs? Use the button bellow!\`\`\`**`);
                    perksEmbed.addFields(
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )
                    await int.editReply({
                        content: '',
                        embeds: [perksEmbed],
                        components: [component],
                    });
                } else {
                    let perkMenu = new SelectMenuBuilder()
                        .setCustomId('manage-perks')
                        .setPlaceholder('Manage your perks.');

                    for (const perk of submittedPerks) {
                        perkMenu.addOptions({ label: perk.perk, value: `${perk.perk}-${perk.collabName}`, description: perk.collabName });
                        perksEmbed.addFields(
                            {
                                name: "‎",
                                value: `\`\`✒️ ${perk.perk}\`\`\n **└** *Used on the ${perk.collabName}*`
                            }
                        )
                    }
                    perksEmbed.addFields(
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )
                    if (userPerks.length !== 0) {
                        perksEmbed.setDescription(`*Seems like you have some perks submitted!*\n                                                                                                        **\`\`\`ml\n✅ To edit and use your perk(s) use the menus bellow!\`\`\`**`);
                        let useMenu = new SelectMenuBuilder()
                            .setCustomId('use-perks')
                            .setPlaceholder('Use your perks.');
                        const unclaimedPerks = userPerks.filter(p => !submittedPerks.some(s => p.name === s.perk));
                        for (const perk of unclaimedPerks) {
                            if (perk.renewalPrice) {
                                useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                            }
                        }
                        const perkComponent = new ActionRowBuilder().addComponents(perkMenu);
                        const useComponent = new ActionRowBuilder().addComponents(useMenu);
                        await int.editReply({
                            content: '',
                            embeds: [perksEmbed],
                            components: [perkComponent, useComponent, component],
                        });
                    } else {
                        perksEmbed.setDescription(`*Seems like you have some perks submitted!*\n                                                                                                        **\`\`\`ml\n✅ To edit your perk(s) use the menu bellow!\`\`\`**`);
                        const perkComponent = new ActionRowBuilder().addComponents(perkMenu);
                        await int.editReply({
                            content: '',
                            embeds: [perksEmbed],
                            components: [perkComponent, component],
                        });
                    }
                }
            } finally {
                mongoClientCollabs.close();
                mongoClientUsers.close();
            }
            return;
        }


        if (subcommand === "premium") {
            let renewalPrice = '';
            let decayString = '';
            let tierString = "**No premium status found!**";
            let tierDetails = '';
            const username = int.user.tag;
            const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
            const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
            const premiumEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Premium Dashboard\n', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')

            if (!guildMember.roles.cache.has('743505566617436301')) {
                try {
                    let userPerks = await localFunctions.getPerks(userId, collection);
                    if (userPerks.length !== 0) {
                        let useMenu = new SelectMenuBuilder()
                            .setCustomId('use-perks')
                            .setPlaceholder('Use your perks.')

                        premiumEmbed.setAuthor({ name: `Welcome to your perks dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                        premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n✅ Perks available to use!\`\`\`**`);
                        for (const perk of userPerks) {
                            premiumEmbed.addFields({
                                name: " ",
                                value: `\`\`🎫 ${perk.name}\`\`
                                 [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}\n └ Your current renewal price is ${perk.individualPrice}$.`
                            });
                            useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                        }
                        const useComponents = new ActionRowBuilder().addComponents(useMenu);
                        let buyComponents = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('premium-info')
                                .setLabel('✒️ About')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('shopping-cart')
                                .setLabel('🛒 Cart')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('perks-buy')
                                .setLabel('🔀 Perk Shop')
                                .setStyle('Primary'),
                        )
                        premiumEmbed.addFields(
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            }
                        )
                        await int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [useComponents, buyComponents],
                        });
                    } else {
                        premiumEmbed.setDescription('**\`\`\`ml\n 🚀 Welcome to the premium section!\`\`\`**                                                                                                           **In this section, you can find information about the current premium tiers and their perks!**\n\n**• The perks are ACCUMULATIVE.** \n**• After one collab, most perks will need to be RENEWED.** \n**• If there is no renewal, there is a DECAY into former supporter.**\n**• You can also purchase SINGLE PERKS for single use in collabs.**\n**• Premium includes bump immunity.**')
                        premiumEmbed.addFields(
                            { name: " ", value: "**\`\`\`ml\n⚠️ Only the prominent perks are mentioned for each tier.\`\`\`**" },
                            { name: " ", value: "\`\`🎫 Mirage I Premium | Price: 5$\`\`\n └ Exclusive profile picture version." },
                            { name: " ", value: "\`\`🎫 Mirage II Premium | Price: 10$\`\`\n └ Animated Banner." },
                            { name: " ", value: "\`\`🎫 Mirage III Premium | Price: 15$\`\`\n └ Animated Stream Overlay." },
                            { name: " ", value: "\`\`🎫 Mirage IV Premium | Price: 20$\`\`\n └ Early collab delivery.\n" },
                            { name: " ", value: "\`\`🎫 Mirage V Premium | Price: 40$\`\`\n └ Customized collab themed osu! skin." },
                            { name: " ", value: "\`\`🎫 Mirage VI Premium | Price: 100$\`\`\n └ Collab early access." },
                            { name: " ", value: "\`\`🎫 Mirage VII Premium | Price: 250$\`\`\n └ Host your own megacollab." },
                            { name: " ", value: "**\`\`\`prolog\n💎 Find the full details about each tier in the list bellow.\`\`\`\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>**" },
                        );

                        const defaultComponents = new ActionRowBuilder().addComponents(
                            new SelectMenuBuilder()
                                .setCustomId('premium-tiers')
                                .setPlaceholder('Check the detailed tiers.')
                                .addOptions([
                                    { label: 'Mirage I', value: 'Mirage I', description: 'Cost: 5$' },
                                    { label: 'Mirage II', value: 'Mirage II', description: 'Cost: 10$' },
                                    { label: 'Mirage III', value: 'Mirage III', description: 'Cost: 15$' },
                                    { label: 'Mirage IV', value: 'Mirage IV', description: 'Cost: 20$' },
                                    { label: 'Mirage V', value: 'Mirage V', description: 'Cost: 40$' },
                                    { label: 'Mirage VI', value: 'Mirage VI', description: 'Cost: 100$' },
                                    { label: 'Mirage VII', value: 'Mirage VII', description: 'Cost: 250$' },
                                ])
                        )
                        await int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [defaultComponents],
                        });
                    }
                } finally {
                    mongoClient.close();
                    mongoClientSpecial.close();
                }
            } else {
                try {
                    let userPerks = await localFunctions.getPerks(userId, collection);
                    let premiumData = await localFunctions.getPremiumData(collectionSpecial);
                    let mainComponents = [];
                    let userTier = await localFunctions.getUserTier(userId, collection);
                    let monthlySupportData = await localFunctions.getUserMontlyPremium(userId, collection);

                    if (!userTier && guildMember.roles.cache.has('743505566617436301') && !guildMember.roles.cache.has('1150484454071091280')) {
                        let premiumDetails = await localFunctions.assignPremium(userId, collection, guildMember);
                        userTier = premiumDetails[0];
                        userPerks = premiumDetails[1];
                        tierDetails = premiumDetails[2];
                        tierString = `**Current Tier: ${userTier.name}**`;
                    } else if (userTier) {
                        tierString = `**Current Tier: ${userTier.name}**`;
                        tierDetails = localConstants.premiumTiers.find(tier => tier.name === userTier.name);
                    }

                    if (tierDetails.generalRenewalPrice) {
                        tierString = `${tierString}\n*Renewal price for all perks: ${tierDetails.generalRenewalPrice}$*`;
                    }

                    let activeMonthlySupport = false;
                    if (monthlySupportData) {
                        if (monthlySupportData.status !== "innactive") {
                            activeMonthlySupport = true;
                        }
                    }

                    let subComponent;
                    if (activeMonthlySupport) {
                        subComponent = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('sub-manage')
                                .setLabel('💵 Manage Monthly Subscription')
                                .setStyle('Primary'),
                        )
                    } else {
                        subComponent = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('subscribe')
                                .setLabel('💵 Subscribe')
                                .setStyle('Primary'),
                        )
                    }

                    if (userPerks?.length || activeMonthlySupport) {
                        let useMenu = new SelectMenuBuilder()
                            .setCustomId('use-perks')
                            .setPlaceholder('Use your perks.')

                        premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                        // to rewrite into a single for loop with switch case
                        if (userPerks.some(perk => perk.singleUse === false)) {
                            premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n🔮 Permanent perks\`\`\`**`)
                            tierString = ' '
                            for (const perk of userPerks) {
                                if ((!perk.singleUse || userTier.name === 'Mirage VII' || userTier.name === 'Mirage X') && perk.name !== 'Host your own Megacollab' && perk.name !== 'Custom Endless Mirage Hoodie') {
                                    if (perk.singleUse) {
                                        useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                                    }
                                    premiumEmbed.addFields({
                                        name: " ",
                                        value: `\`\`✒️ ${perk.name}\`\`\n └ ${perk.description}`
                                    });
                                }
                            }
                        }
                        if (userPerks.some(perk => perk.singleUse === true)) {
                            if (tierString !== ' ') {
                                premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n✅ Perks available to use!\`\`\`**`)
                            } else {
                                premiumEmbed.addFields(
                                    {
                                        name: " ",
                                        value: "**\`\`\`ml\n✅ Perks available to use!\`\`\`**",
                                    },
                                )
                            }
                            for (const perk of userPerks) {
                                if (perk.singleUse && userTier.name !== 'Mirage VII' && userTier.name !== 'Mirage X') {
                                    if (perk.renewalPrice) {
                                        renewalPrice = `\n └ Your current renewal price is ${perk.renewalPrice}$.`;
                                    } else {
                                        renewalPrice = '';
                                    }
                                    premiumEmbed.addFields({
                                        name: " ",
                                        value: `\`\`🎫 ${perk.name}\`\`\n ├ ${perk.description}${renewalPrice}`
                                    });
                                    useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                                } else if (perk.name === 'Custom Endless Mirage Hoodie' || perk.name === 'Host your own Megacollab') {
                                    premiumEmbed.addFields({
                                        name: " ",
                                        value: `\`\`🎫 ${perk.name}\`\`
                                     └ ${perk.description}`
                                    });
                                    useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                                }
                            }
                        }

                        mainComponents = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('premium-info')
                                .setLabel('✒️ About')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('shopping-cart')
                                .setLabel('🛒 Cart')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('perks-buy')
                                .setLabel('🔀 Shop')
                                .setStyle('Primary'),
                        )

                        if (userTier.name !== "Mirage VII" || userTier.name !== "Mirage X") {
                            mainComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('upgrade-tier')
                                    .setLabel('⏏️ Upgrade')
                                    .setStyle('Primary'),
                                new ButtonBuilder()
                                    .setCustomId('premium-renew')
                                    .setLabel('🔁 Renew')
                                    .setStyle('Primary'),
                            );
                        }

                        if (activeMonthlySupport) {
                            const currentTier = localFunctions.premiumToInteger(userTier.name);
                            let nextTier = 0;
                            let fullNextTier;
                            if (currentTier !== 7 && currentTier !== 10) {
                                nextTier = currentTier + 1;
                                fullNextTier = localConstants.premiumTiers[nextTier - 1];
                                const totalSubAmount = parseInt(monthlySupportData.total);
                                const monthlySubAmount = parseInt(monthlySupportData.currentAmount);
                                const nextTierAmount = fullNextTier.cost;
                                const pendingAmount = nextTierAmount - totalSubAmount;
                                const monthsPending = Math.ceil(pendingAmount / monthlySubAmount);
                                premiumEmbed.addFields(
                                    {
                                        name: " ",
                                        value: `**\`\`\`ml\n✅ Active subscription status!\`\`\`**\n\`\`❤️ Current Monthly Amount\`\`\n └ ${monthlySubAmount}$\n\n\`\`❤️ Time Pending for the Next Tier\`\`\n └ ${monthsPending} Month(s)!\n\n\`\`❤️ Amount Pending for the Next Tier\`\`\n └ ${pendingAmount}$\n\n*Your current subscription includes automatic renewal for all perks and free access to deluxe collabs.*\n*For more info about your subscription, use the manage button bellow!*`,
                                    },
                                )
                            } else {
                                premiumEmbed.addFields(
                                    {
                                        name: " ",
                                        value: "**\`\`\`ml\n✅ Active subscription status!\`\`\`**\n**You're currently at the peak tier! Thank you for your incredible support!**\n\n*Your current subscription includes automatic renewal for all perks and free access to deluxe collabs.*\n*For more info about your subscription, use the manage button bellow!*",
                                    }
                                )
                            }

                        }

                        try {
                            if (useMenu.options[0].data) {
                                const useComponents = new ActionRowBuilder().addComponents(useMenu);
                                premiumEmbed.addFields(
                                    {
                                        name: "‎",
                                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                    }
                                )
                                await int.editReply({
                                    content: '',
                                    embeds: [premiumEmbed],
                                    components: [useComponents, mainComponents, subComponent],
                                });
                            }
                        } catch (error) {
                            premiumEmbed.addFields(
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                }
                            )
                            await int.editReply({
                                content: '',
                                embeds: [premiumEmbed],
                                components: [mainComponents, subComponent],
                            });
                        }

                    } else {

                        decayString = `\n └ Your tier will decay <t:${premiumData.date}:R>.`;

                        premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' })
                        premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n⚠️ No perks available to claim!\`\`\`**`)
                        premiumEmbed.addFields({ name: " ", value: `\`\`🎫 Notice\`\`\n ├ It\'s recommended to renew any of your perks.${decayString}` })
                        mainComponents = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('premium-info')
                                .setLabel('✒️ About')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('shopping-cart')
                                .setLabel('🛒 Cart')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('perks-buy')
                                .setLabel('🔀 Shop')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('premium-renew')
                                .setLabel('🔁 Renew')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('upgrade-tier')
                                .setLabel('⏏️ Upgrade')
                                .setStyle('Primary'),
                        )
                        premiumEmbed.addFields(
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            }
                        )
                        await int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [mainComponents, subComponent],
                        });
                    }
                } finally {
                    mongoClient.close();
                    mongoClientSpecial.close();
                }
            }
            return;
        }

        if (subcommandGroup === "admin") {
            if (subcommand === "set-bumps") {
                if (!guildMember.roles.cache.has('630636502187114496')) {
                    await int.editReply('You are not allowed to do this.');
                    return;
                }
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const currentDate = Math.floor(Date.now() / 1000);
                try {
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access" || c.status === "on design"));
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        const collab = openMegacollab;
                        let bumps = collab.bumps;
                        const dashboardEmbed = new EmbedBuilder()
                            .setFooter({ text: 'Endless Mirage | Bumps Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setDescription(`**\`\`\`ml\n🧱 Endless Mirage | Admin Bump Dashboard\`\`\`**\n**${collab.name}**`);
                        if (typeof bumps === "undefined") {
                            dashboardEmbed.addFields(
                                {
                                    name: "‎",
                                    value: "There are no bumps for this collab yet..."
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                }
                            );
                            const components = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('start-bump')
                                    .setLabel('New Bump')
                                    .setStyle('Success'),
                            );

                            int.editReply({ embeds: [dashboardEmbed], components: [components] });

                        } else {
                            let i = 1;
                            for (const bump of bumps) {
                                dashboardEmbed.addFields(
                                    {
                                        name: "‎",
                                        value: `Bump #${i}\n- **Starting Date:** ${bump.startingDate}\n- **Duration:** ${bump.days} days`
                                    }
                                )
                            }
                            dashboardEmbed.addFields(
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                }
                            )
                            const latestBumpIndex = bumps.length - 1;
                            if (currentDate - bumps[latestBumpIndex].startingDate > bumps[latestBumpIndex].days * 24 * 60 * 60 && bumps.length !== 4) {
                                const components = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('start-bump')
                                        .setLabel('New Bump')
                                        .setStyle('Success'),
                                );

                                int.editReply({ embeds: [dashboardEmbed], components: [components] });
                            } else if (bumps.length !== 4) {
                                const components = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('stop-bump')
                                        .setLabel('Stop Bump')
                                        .setStyle('Danger'),
                                );

                                int.editReply({ embeds: [dashboardEmbed], components: [components] });
                            } else {
                                const components = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('filter-bump')
                                        .setLabel('Filter Users')
                                        .setStyle('Primary'),
                                );

                                int.editReply({ embeds: [dashboardEmbed], components: [components] });
                            }

                        }
                    }
                } finally {
                    mongoClient.close();
                }
            }

            if (subcommand === "link") {
                if (!guildMember.roles.cache.has('630636502187114496')) {
                    await int.editReply('You are not allowed to do this.');
                    return;
                }
                const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
                const user = await v2.user.details(int.options.getString('osuid'), int.options.getString('gamemode'));
                if (typeof user === "undefined") {
                    await int.editReply('User not found...');
                    return;
                }
                try {
                    const userFiltered = localFunctions.removeFields(user, localConstants.unnecesaryFieldsOsu);
                    userFiltered.osu_id = userFiltered.id;
                    delete userFiltered.id;
                    const userTop100 = await v2.scores.user.category(user.id, 'best', { mode: int.options.getString('gamemode'), limit: '100' });
                    await int.editReply('Performing Skill Calculations and getting data analytics... This might take a minute or two.');
                    const skills = await localFunctions.calculateSkill(userTop100, int.options.getString('gamemode'));
                    let modsData = await localFunctions.analyzeMods(userTop100);
                    const filler = {
                        mod: "--",
                        percentage: "--"
                    }
                    let i = 0;
                    while (i < 4) {
                        if (typeof modsData.top4Mods[i] === "undefined") {
                            modsData.top4Mods.push(filler);
                        }
                        i++;
                    }
                    userFiltered.skillRanks = skills;
                    userFiltered.modsData = modsData;
                    await localFunctions.verifyUserManual(int.options.getString('discordid'), userFiltered, collection);
                    await int.editReply(`<@${int.user.id}> User linked succesfully.`);
                } finally {
                    mongoClient.close();
                }
                return;
            }
            if (subcommand === "manage") {
                if (!guildMember.roles.cache.has('630636502187114496')) {
                    await int.editReply('You are not allowed to do this.');
                    return;
                }
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                try {
                    let collab = await localFunctions.getCollab(int.options.getString('collab'), collection)
                    let components = [];
                    let extraComponents = [];
                    let URLstring = '';
                    if (typeof collab.spreadsheetID !== "undefined") {
                        URLstring = `  [Spreadsheet URL](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})\n`
                    }
                    const dashboardEmbed = new EmbedBuilder()
                        .setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                        .setColor('#f26e6a')
                        .setDescription(`**\`\`\`ml\n🧱 Endless Mirage | Admin Collabs Dashboard\`\`\`**\n**${collab.name}**\n${URLstring}`);

                    let extraString = '';

                    if (collab.user_cap !== 0) {
                        extraString = `User Limit: ${collab.user_cap}\n`
                    } else {
                        extraString = "Unlimited\n"
                    }

                    dashboardEmbed.addFields(
                        {
                            name: "‎",
                            value: `┌ Type: ${localFunctions.capitalizeFirstLetter(collab.type)}\n├ Topic: ${localFunctions.capitalizeFirstLetter(collab.topic)}\n└ Status: ${localFunctions.capitalizeFirstLetter(collab.status)}\n`,
                            inline: true
                        }
                    );

                    dashboardEmbed.addFields(
                        {
                            name: "‎",
                            value: `┌ Class: ${localFunctions.capitalizeFirstLetter(collab.restriction)}\n├ Opening date: <t:${parseInt(collab.opening)}:R>\n└ ${extraString}`,
                            inline: true
                        }
                    );

                    dashboardEmbed.addFields(
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )

                    if (int.user.id === collab.host) {
                        components = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('edit-collab')
                                .setLabel('✏️ Edit')
                                .setStyle('Primary'),
                        )
                        if (collab.type === "pooled") {
                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('pool-collab')
                                    .setLabel('📁 Pool')
                                    .setStyle('Primary'),
                            )
                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('manage-pick-collab')
                                    .setLabel('🔩 Picks')
                                    .setStyle('Primary'),
                            )
                        }

                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('reset-collab')
                                .setLabel('🔁 Reset')
                                .setStyle('Danger'),
                        )

                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('delete-collab')
                                .setLabel('🚮 Delete')
                                .setStyle('Danger'),
                        )

                        if (collab.status !== "on design" || int.user.id === "687004886922952755") {
                            extraComponents = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('export-collab')
                                    .setLabel('⬇️ Export')
                                    .setStyle('Success'),
                            )
                            if (typeof collab.perks !== "undefined") {
                                extraComponents.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('export-collab-perks')
                                        .setLabel('⬇️ Perks')
                                        .setStyle('Success'),
                                )
                            }
                            extraComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('deliver-collab')
                                    .setLabel('⬆️ Deliver')
                                    .setStyle('Success'),
                            )
                            await int.editReply({
                                content: '',
                                embeds: [dashboardEmbed],
                                components: [components, extraComponents],
                            });
                        } else {
                            await int.editReply({
                                content: '',
                                embeds: [dashboardEmbed],
                                components: [components]
                            });
                        }

                    } else {
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('manage-pick-collab')
                                .setLabel('🔩 Picks')
                                .setStyle('Primary'),
                        )
                        if (collab.status !== "on design") {
                            extraComponents = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('export-collab')
                                    .setLabel('⬇️ Export')
                                    .setStyle('Success'),
                            )
                        }
                    }

                    adminCache.set(int.user.id, {
                        collab: collab,
                    })

                } catch (e) {
                    console.log(e)
                    await int.editReply('Something went wrong...')
                } finally {
                    mongoClient.close();
                }
            }
        }

        if (subcommandGroup === "quick") {
            if (subcommand === "join") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection: blacklistCollection, client: mongoClientBlacklist } = await connectToMongoDB("Blacklist");
                try {
                    const currentDate = Math.floor(new Date().getTime() / 1000);
                    const blacklistCheck = await localFunctions.getBlacklist(int.user.id, blacklistCollection)
                    if (blacklistCheck) return int.editReply('You\'re blacklisted from all collabs and cannot participate...');
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    let openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        try {
                            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) !== "undefined") {
                                return int.editReply('You\'re already participating on this collab! To edit your pick use the ``/collabs manage`` command.');
                            }
                        } catch { }
                        let pick = int.options.getString('pick');
                        const userOsuDataFull = await localFunctions.getOsuData(int.user.id, userCollection);
                        if (!userOsuDataFull) {
                            const components = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('link-osu')
                                    .setLabel('🔗 Link your osu! Account')
                                    .setStyle('Success'),
                            )
                            return int.editReply({
                                content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                                components: [components]
                            });
                        }
                        let referral = int.options.getString('referral') ? int.options.getString('referral') : false;
                        let inviter;
                        if (referral) {
                            inviter = await localFunctions.getInviter(referral, userCollection);
                            if (inviter) {
                                if (inviter._id === userId) return int.editReply('You cannot use your own referral code silly!');
                            } else {
                                referral = false;
                            }
                        }
                        if (int.options.getString('avatar_text').length > openMegacollab.fieldRestrictions.av) return int.editReply(`The character limit for the avatar is of ${openMegacollab.fieldRestrictions.av} characters!`);
                        if (int.options.getString('banner_text').length > openMegacollab.fieldRestrictions.ca) return int.editReply(`The character limit for the banner is of ${openMegacollab.fieldRestrictions.ca} characters!`);
                        if (int.options.getString('banner_quote') !== null) {
                            if (int.options.getString('banner_quote').length > openMegacollab.fieldRestrictions.ca_quote) return int.editReply(`The character limit for the quote is of ${openMegacollab.fieldRestrictions.ca_quote} characters!`);
                        }

                        if (typeof openMegacollab.lockSystem !== "undefined") { /*Prevents ratelimit*/
                            if (typeof openMegacollab.lockSystem.current === "undefined") { /*System startup from first pick*/
                                const current = {
                                    participations: 0,
                                    time: 0,
                                    lastParticipant: 0
                                }
                                openMegacollab.lockSystem.current = current;
                                console.log('Starting up lock system...');
                                await localFunctions.setLockSystem(openMegacollab.name, openMegacollab.lockSystem, collection);
                            } else { /*Allows or denys the entry*/
                                if (openMegacollab.lockSystem.current.participations >= openMegacollab.lockSystem.users && currentDate < (openMegacollab.lockSystem.current.time + openMegacollab.lockSystem.timeout * 60)) {
                                    console.log('Attempt to join the collab while locked!');
                                    return int.editReply(`The collab is currently locked to prevent ratelimit! Please try to join again <t:${openMegacollab.lockSystem.current.time + openMegacollab.lockSystem.timeout * 60}:R>`);
                                }

                                if (((currentDate > (openMegacollab.lockSystem.current.lastParticipant + 120)) || (currentDate + openMegacollab.lockSystem.timeout * 60) >= openMegacollab.lockSystem.current.time) && openMegacollab.lockSystem.current.time !== 0) { /*Reset the system if over 2m have passed and no one has joined, or if the timeout has passed*/
                                    const current = {
                                        participations: 0,
                                        time: 0
                                    }
                                    openMegacollab.lockSystem.current = current;
                                    await localFunctions.setLockSystem(openMegacollab.name, openMegacollab.lockSystem, collection);
                                    console.log('Resetting lock system...');
                                }
                            }
                        }
                        let fullPick;
                        openMegacollab = await localFunctions.getCollab(openMegacollab.name, collection);
                        if (typeof pick === 'string' && /^\d+$/.test(pick)) {
                            fullPick = await openMegacollab.pool.items.find(i => i.id === pick);
                        } else {
                            pick = pick.split('-')[0].trim();
                            fullPick = await openMegacollab.pool.items.find(i => i.name === pick);
                        }
                        if (fullPick.status === "picked") {
                            return int.editReply('This character got picked while you were selecting...');
                        }
                        await localFunctions.setCollabParticipation(openMegacollab.name, collection, pick);

                        let prestigeLevel = 0;
                        let tier = 0;
                        let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                        if (guildMember.roles.cache.has('743505566617436301')) {
                            const userTier = await localFunctions.getUserTier(userId, userCollection);
                            if (!userTier && !guildMember.roles.cache.has('1150484454071091280')) {
                                let premiumDetails = await localFunctions.assignPremium(userId, userCollection, guildMember);
                                tier = localFunctions.premiumToInteger(premiumDetails[0].name);
                            } else {
                                tier = localFunctions.premiumToInteger(userTier.name);
                            }
                        }
                        if (typeof prestige !== "undefined") {
                            prestige = prestige.name;
                            prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                        }
                        let userOsuData = localFunctions.flattenObject(userOsuDataFull);
                        const userParticipant = {
                            discordId: userId,
                            discordTag: int.user.tag,
                            joinDate: currentDate,
                            av_text: int.options.getString('avatar_text'),
                            ca_text: int.options.getString('banner_text'),
                            ca_quote: int.options.getString('banner_quote') ? int.options.getString('banner_quote') : "",
                            prestige: prestigeLevel,
                            tier: tier,
                            bump_imune: tier ? true : false,
                            referral: referral ? referral : false,
                            collabName: openMegacollab.name,
                        };
                        const data = { ...userParticipant, ...fullPick, ...userOsuData };
                        await localFunctions.addCollabParticipant(openMegacollab.name, collection, data);
                        const participants = openMegacollab ? openMegacollab.participants || [] : [];
                        if ((participants.length + 1) === openMegacollab.user_cap) {
                            await localFunctions.setCollabStatus(openMegacollab.name, "full", collection);
                        }
                        const profileData = {
                            collabName: openMegacollab.name,
                            collabPick: fullPick,
                            joinDate: currentDate,
                            av_text: int.options.getString('avatar_text'),
                            ca_text: int.options.getString('banner_text'),
                            ca_quote: int.options.getString('banner_quote') ? int.options.getString('banner_quote') : "",
                            prestige: prestigeLevel,
                            tier: tier
                        }

                        userCollabs.push(profileData);
                        await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                        await int.editReply(`You've joined the collab succesfully! Pick: ${fullPick.name}\nYour participation should appear on the spreadsheet shortly. Use the command \`\`/collabs manage\`\` to manage your participation!`);
                        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
                        const joinEmbed = new EmbedBuilder()
                            .setFooter({ text: 'Endless Mirage | New Collab Participant', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setURL('https://endlessmirage.net/')
                            .setThumbnail(userOsuDataFull.avatar_url)
                            .setAuthor({ name: `New Participation on the ${openMegacollab.name}!`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setDescription(`**\`\`\`ml\n🎫 osu! Info\`\`\`**                                                                                    `)
                            .addFields(
                                {
                                    name: "‎",
                                    value: `┌ User: **${userOsuDataFull.username}**\n├ Country: **${userOsuDataFull.country_code}**\n├ Rank: **#${userOsuDataFull.statistics.global_rank}**\n├ Peak: **#${userOsuDataFull.rank_highest.rank}**\n└ Mode: **${userOsuDataFull.playmode}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ PP: **${userOsuDataFull.statistics.pp}pp**\n├ Level: **${userOsuDataFull.statistics.level.current}**\n├ Playcount: **${userOsuDataFull.statistics.play_count}**\n├ Playtime: **${Math.floor(userOsuDataFull.statistics.play_time / 3600)}h **\n└ Followers: **${userOsuDataFull.follower_count}**`,
                                    inline: true
                                }
                            )
                        try {
                            joinEmbed.addFields(
                                {
                                    name: "‎",
                                    value: `**\`\`\`ml\n🧊 Account Analytics\`\`\`**                                                                                    `
                                },
                                {
                                    name: "‎",
                                    value: `┌ ACC: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].int : "..."}**\n├ REA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].int : "..."}**\n├ ${userOsuDataFull.skillRanks[2].skill === "Aim" ? "AIM" : "CON"}: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].int : "..."}**\n├ SPD: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].int : "..."}**\n├ STA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].int : "..."}**\n└ PRE: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].int : "..."}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ Top 1 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[0].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[0].percentage) : "..."}%**\n├ Top 2 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[1].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[1].percentage) : "..."}%**\n├ Top 3 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[2].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[2].percentage) : "..."}%**\n├ Top 4 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[3].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[3].percentage) : "..."}%**\n└ Combination: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.mostCommonModCombination.combination : "..."}**`,
                                    inline: true
                                }
                            )
                        } catch {
                            joinEmbed.addFields(
                                {
                                    name: "‎",
                                    value: `**\`\`\`ml\n🧊 Account Analytics\`\`\`**                                                                                    `
                                },
                                {
                                    name: "‎",
                                    value: `There was some error trying to get your analytics... Please try updaging them on your collabs profile command.`,
                                    inline: true
                                },
                            )
                        }
                        joinEmbed.addFields(
                            {
                                name: "‎",
                                value: `**\`\`\`ml\n📀 Participation Data\`\`\`**                                                                                    `
                            },
                            {
                                name: "‎",
                                value: `┌ Pick ID: **${fullPick.id}**\n├ Name: **${fullPick.name}**\n└ Series: **${fullPick.series}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: `┌ Category: **${fullPick.category}**\n├ Premium Tier: **${tier}**\n└ Prestige Level: **${prestigeLevel}**`,
                                inline: true
                            },
                        )
                        if (referral) {
                            joinEmbed.addFields(
                                {
                                    name: "‎",
                                    value: `Referred by <@${inviter._id}>`
                                }
                            )
                        }
                        joinEmbed.addFields(
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            }
                        )
                        const imageEmbed = new EmbedBuilder()
                            .setImage(fullPick.imgURL)
                            .setFooter({ text: 'Endless Mirage | Pick Image', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setURL('https://endlessmirage.net/')

                        logChannel.send({ content: `<@${userId}>`, embeds: [joinEmbed, imageEmbed] });
                        if (typeof openMegacollab.lockSystem !== "undefined") { /*Prevents ratelimit*/
                            openMegacollab.lockSystem.current.participations = openMegacollab.lockSystem.current.participations + 1;
                            openMegacollab.lockSystem.current.lastParticipant = Math.floor(new Date().getTime() / 1000);
                            if (openMegacollab.lockSystem.current.participations === openMegacollab.lockSystem.users) {
                                openMegacollab.lockSystem.current.time = Math.floor(new Date().getTime() / 1000);
                                console.log('Locking the collab...');
                            }
                            await localFunctions.setLockSystem(openMegacollab.name, openMegacollab.lockSystem, collection);
                        }

                        while (true) {
                            try {
                                await localFunctions.setParticipationOnSheet(openMegacollab, fullPick, userOsuDataFull.username);
                                console.log('Sheet update done!');
                                break;
                            } catch {
                                console.log('Sheet update failed, retring in 2 minutes...');
                                await localFunctions.delay(2 * 60 * 1000);
                            }
                        }

                        await guildMember.roles.add(openMegacollab.roleId);
                    }
                } catch (e) {
                    console.log(e);
                    await int.editReply('Your pick has been locked but there has been an error while joining the collab. Please ping the owner in the support channel!');
                } finally {
                    mongoClient.close();
                    mongoClientUsers.close();
                    mongoClientBlacklist.close();
                }
                return;
            }

            if (subcommand === "join-random") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection: blacklistCollection, client: mongoClientBlacklist } = await connectToMongoDB("Blacklist");
                try {
                    const currentDate = Math.floor(new Date().getTime() / 1000);
                    const blacklistCheck = await localFunctions.getBlacklist(int.user.id, blacklistCollection)
                    if (blacklistCheck) return int.editReply('You\'re blacklisted from all collabs and cannot participate...');
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    let openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        try {
                            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) !== "undefined") {
                                return int.editReply('You\'re already participating on this collab! To edit your pick use the ``/collabs manage`` command.');
                            }
                        } catch { }

                        const userOsuDataFull = await localFunctions.getOsuData(int.user.id, userCollection);
                        if (!userOsuDataFull) {
                            const components = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('link-osu')
                                    .setLabel('🔗 Link your osu! Account')
                                    .setStyle('Success'),
                            )
                            return int.editReply({
                                content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                                components: [components]
                            });
                        }
                        let referral = int.options.getString('referral') ? int.options.getString('referral') : false;
                        let inviter;
                        if (referral) {
                            inviter = await localFunctions.getInviter(referral, userCollection);
                            if (inviter) {
                                if (inviter._id === userId) return int.editReply('You cannot use your own referral code silly!');
                            } else {
                                referral = false;
                            }
                        }
                        if (int.options.getString('avatar_text').length > openMegacollab.fieldRestrictions.av) return int.editReply(`The character limit for the avatar is of ${openMegacollab.fieldRestrictions.av} characters!`);
                        if (int.options.getString('banner_text').length > openMegacollab.fieldRestrictions.ca) return int.editReply(`The character limit for the banner is of ${openMegacollab.fieldRestrictions.ca} characters!`);
                        if (int.options.getString('banner_quote') !== null) {
                            if (int.options.getString('banner_quote').length > openMegacollab.fieldRestrictions.ca_quote) return int.editReply(`The character limit for the quote is of ${openMegacollab.fieldRestrictions.ca_quote} characters!`);
                        }

                        if (typeof openMegacollab.lockSystem !== "undefined") { /*Prevents ratelimit*/
                            if (typeof openMegacollab.lockSystem.current === "undefined") { /*System startup from first pick*/
                                const current = {
                                    participations: 0,
                                    time: 0,
                                    lastParticipant: 0
                                }
                                openMegacollab.lockSystem.current = current;
                                console.log('Starting up lock system...');
                                await localFunctions.setLockSystem(openMegacollab.name, openMegacollab.lockSystem, collection);
                            } else { /*Allows or denys the entry*/
                                if (openMegacollab.lockSystem.current.participations >= openMegacollab.lockSystem.users && currentDate < (openMegacollab.lockSystem.current.time + openMegacollab.lockSystem.timeout * 60)) {
                                    console.log('Attempt to join the collab while locked!');
                                    return int.editReply(`The collab is currently locked to prevent ratelimit! Please try to join again <t:${openMegacollab.lockSystem.current.time + openMegacollab.lockSystem.timeout * 60}:R>`);
                                }
                                if (((currentDate > (openMegacollab.lockSystem.current.lastParticipant + 120)) || (currentDate + openMegacollab.lockSystem.timeout * 60) >= openMegacollab.lockSystem.current.time) && openMegacollab.lockSystem.current.time !== 0) { /*Reset the system if over 2m have passed and no one has joined, or if the timeout has passed*/
                                    const current = {
                                        participations: 0,
                                        time: 0
                                    }
                                    openMegacollab.lockSystem.current = current;
                                    await localFunctions.setLockSystem(openMegacollab.name, openMegacollab.lockSystem, collection);
                                    console.log('Resetting lock system...');
                                }
                            }
                        }

                        let pick = 0;
                        let idCheck = 0;
                        let fullPick;

                        while (pick === 0) {
                            openMegacollab = await localFunctions.getCollab(openMegacollab.name, collection);
                            idCheck = Math.ceil(Math.random() * openMegacollab.pool.size);
                            fullPick = openMegacollab.pool.items[idCheck];
                            if (fullPick.status !== "picked") {
                                pick = fullPick.id;
                            }
                        }

                        await localFunctions.setCollabParticipation(openMegacollab.name, collection, pick);
                        let prestigeLevel = 0;
                        let tier = 0;
                        let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                        if (guildMember.roles.cache.has('743505566617436301')) {
                            const userTier = await localFunctions.getUserTier(userId, userCollection);
                            if (!userTier && !guildMember.roles.cache.has('1150484454071091280')) {
                                let premiumDetails = await localFunctions.assignPremium(userId, userCollection, guildMember);
                                tier = localFunctions.premiumToInteger(premiumDetails[0].name);
                            } else {
                                tier = localFunctions.premiumToInteger(userTier.name);
                            }
                        }
                        if (typeof prestige !== "undefined") {
                            prestige = prestige.name;
                            prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                        }
                        let userOsuData = localFunctions.flattenObject(userOsuDataFull);
                        const userParticipant = {
                            discordId: userId,
                            discordTag: int.user.tag,
                            joinDate: currentDate,
                            av_text: int.options.getString('avatar_text'),
                            ca_text: int.options.getString('banner_text'),
                            ca_quote: int.options.getString('banner_quote') ? int.options.getString('banner_quote') : "",
                            prestige: prestigeLevel,
                            tier: tier,
                            bump_imune: tier ? true : false,
                            referral: referral ? referral : false,
                            collabName: openMegacollab.name,
                        };
                        const data = { ...userParticipant, ...fullPick, ...userOsuData };
                        await localFunctions.addCollabParticipant(openMegacollab.name, collection, data);
                        const participants = openMegacollab ? openMegacollab.participants || [] : [];
                        if ((participants.length + 1) === openMegacollab.user_cap) {
                            await localFunctions.setCollabStatus(openMegacollab.name, "full", collection);
                        }
                        const profileData = {
                            collabName: openMegacollab.name,
                            collabPick: fullPick,
                            joinDate: currentDate,
                            av_text: int.options.getString('avatar_text'),
                            ca_text: int.options.getString('banner_text'),
                            ca_quote: int.options.getString('banner_quote') ? int.options.getString('banner_quote') : "",
                            prestige: prestigeLevel,
                            tier: tier
                        }

                        userCollabs.push(profileData);
                        await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                        await int.editReply(`You've joined the collab succesfully! Pick: ${fullPick.name}\nYour participation should appear on the spreadsheet shortly. Use the command \`\`/collabs manage\`\` to manage your participation!`);
                        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
                        const joinEmbed = new EmbedBuilder()
                            .setFooter({ text: 'Endless Mirage | New Collab Participant', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setURL('https://endlessmirage.net/')
                            .setThumbnail(userOsuDataFull.avatar_url)
                            .setAuthor({ name: `New Participation on the ${openMegacollab.name}!`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setDescription(`**\`\`\`ml\n🎫 osu! Info\`\`\`**                                                                                    `)
                            .addFields(
                                {
                                    name: "‎",
                                    value: `┌ User: **${userOsuDataFull.username}**\n├ Country: **${userOsuDataFull.country_code}**\n├ Rank: **#${userOsuDataFull.statistics.global_rank}**\n├ Peak: **#${userOsuDataFull.rank_highest.rank}**\n└ Mode: **${userOsuDataFull.playmode}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ PP: **${userOsuDataFull.statistics.pp}pp**\n├ Level: **${userOsuDataFull.statistics.level.current}**\n├ Playcount: **${userOsuDataFull.statistics.play_count}**\n├ Playtime: **${Math.floor(userOsuDataFull.statistics.play_time / 3600)}h **\n└ Followers: **${userOsuDataFull.follower_count}**`,
                                    inline: true
                                }
                            )
                        try {
                            joinEmbed.addFields(
                                {
                                    name: "‎",
                                    value: `**\`\`\`ml\n🧊 Account Analytics\`\`\`**                                                                                    `
                                },
                                {
                                    name: "‎",
                                    value: `┌ ACC: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].int : "..."}**\n├ REA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].int : "..."}**\n├ ${userOsuDataFull.skillRanks[2].skill === "Aim" ? "AIM" : "CON"}: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].int : "..."}**\n├ SPD: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].int : "..."}**\n├ STA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].int : "..."}**\n└ PRE: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].int : "..."}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ Top 1 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[0].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[0].percentage) : "..."}%**\n├ Top 2 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[1].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[1].percentage) : "..."}%**\n├ Top 3 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[2].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[2].percentage) : "..."}%**\n├ Top 4 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[3].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[3].percentage) : "..."}%**\n└ Combination: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.mostCommonModCombination.combination : "..."}**`,
                                    inline: true
                                }
                            )
                        } catch {
                            joinEmbed.addFields(
                                {
                                    name: "‎",
                                    value: `**\`\`\`ml\n🧊 Account Analytics\`\`\`**                                                                                    `
                                },
                                {
                                    name: "‎",
                                    value: `There was some error trying to get your analytics... Please try updaging them on your collabs profile command.`,
                                    inline: true
                                },
                            )
                        }
                        joinEmbed.addFields(
                            {
                                name: "‎",
                                value: `**\`\`\`ml\n📀 Participation Data\`\`\`**                                                                                    `
                            },
                            {
                                name: "‎",
                                value: `┌ Pick ID: **${fullPick.id}**\n├ Name: **${fullPick.name}**\n└ Series: **${fullPick.series}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: `┌ Category: **${fullPick.category}**\n├ Premium Tier: **${tier}**\n└ Prestige Level: **${prestigeLevel}**`,
                                inline: true
                            },
                        )
                        if (referral) {
                            joinEmbed.addFields(
                                {
                                    name: "‎",
                                    value: `Referred by <@${inviter._id}>`
                                }
                            )
                        }
                        joinEmbed.addFields(
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            }
                        )
                        const imageEmbed = new EmbedBuilder()
                            .setImage(fullPick.imgURL)
                            .setFooter({ text: 'Endless Mirage | Pick Image', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setURL('https://endlessmirage.net/')

                        logChannel.send({ content: `<@${userId}>`, embeds: [joinEmbed, imageEmbed] });
                        if (typeof openMegacollab.lockSystem !== "undefined") { /*Prevents ratelimit*/
                            openMegacollab.lockSystem.current.participations = openMegacollab.lockSystem.current.participations + 1;
                            openMegacollab.lockSystem.current.lastParticipant = Math.floor(new Date().getTime() / 1000);
                            if (openMegacollab.lockSystem.current.participations === openMegacollab.lockSystem.users) {
                                openMegacollab.lockSystem.current.time = Math.floor(new Date().getTime() / 1000);
                                console.log('Locking the collab...');
                            }
                            await localFunctions.setLockSystem(openMegacollab.name, openMegacollab.lockSystem, collection);
                        }

                        while (true) {
                            try {
                                await localFunctions.setParticipationOnSheet(openMegacollab, fullPick, userOsuDataFull.username);
                                console.log('Sheet update done!');
                                break;
                            } catch {
                                console.log('Sheet update failed, retring in 2 minutes...');
                                await localFunctions.delay(2 * 60 * 1000);
                            }
                        }

                        await guildMember.roles.add(openMegacollab.roleId);

                    }
                } catch (e) {
                    console.log(e);
                    await int.editReply('Your pick has been locked but there has been an error while joining the collab. Please ping the owner in the support channel!');
                } finally {
                    mongoClient.close();
                    mongoClientUsers.close();
                    mongoClientBlacklist.close();
                }
                return;
            }

            if (subcommand === "swap") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
                try {
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    const existingTradeRequest = await localFunctions.getTradeRequest(int.user.id, collectionSpecial);
                    if (existingTradeRequest.length !== 0) {
                        return await int.reply({ content: `You cannot swap your pick when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
                    }
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        try {
                            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) === "undefined") {
                                return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                            }
                        } catch {
                            return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                        }
                        const collab = openMegacollab;
                        if (collab.type === "pooled") {
                            switch (collab.status) {
                                case 'full':
                                    return int.editReply('This collab is full! There is no character to swap with. Try trading!');
                                case 'closed':
                                case 'delivered':
                                case 'early delivery':
                                case 'completed':
                                case 'archived':
                                    return int.editReply('You cannot swap your character at this collab state.');
                            }

                            let pool = collab.pool.items;
                            const pickId = int.options.getString('pick');
                            const newPickFull = pool.find(i => i.id === pickId);
                            if (typeof newPickFull === "undefined") {
                                return int.editReply('Invalid character ID!');
                            }
                            if (newPickFull.status === "picked") {
                                return int.editReply('This character has already been picked!');
                            }
                            const pick = newPickFull.id;
                            const userCollab = userCollabs.find(e => e.collabName === collab.name);
                            const currentPick = pool.find((e) => e.id === userCollab.collabPick.id);
                            const userOsuDataFull = await localFunctions.getOsuData(userId, userCollection);
                            await localFunctions.unsetCollabParticipation(collab.name, collection, currentPick.id);
                            await localFunctions.setCollabParticipation(collab.name, collection, pick);
                            await localFunctions.editCollabParticipantPickOnCollab(collab.name, userId, newPickFull, collection);
                            await localFunctions.editCollabParticipantPickOnUser(userId, collab.name, newPickFull, userCollection);

                            let contentString = "";
                            const snipes = await localFunctions.getCollabSnipes(collab.name, collection, currentPick.id);
                            if (typeof snipes !== "undefined") {
                                if (typeof snipes.find(p => p.pick === currentPick.id) !== "undefined") {
                                    contentString = "Snipers! ";
                                }
                                for (const snipe of snipes) {
                                    contentString = contentString.concat('', `<@${snipe.userId}>`);
                                    await localFunctions.removeCollabSnipe(collab.name, collection, snipe.userId);
                                }
                            }

                            const swapEmbed = new EmbedBuilder()
                                .setFooter({ text: 'Endless Mirage | New Character Swap', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                                .setColor('#f26e6a')
                                .setThumbnail(userOsuDataFull.avatar_url)
                                .setDescription(`**\`\`\`ml\n🎫 New Character Swap!\`\`\`**                                                                                    **${collab.name}**`)
                                .addFields(
                                    {
                                        name: "‎",
                                        value: "**\`\`\`ml\n- Picked\`\`\`**",
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: `┌ Pick ID: **${newPickFull.id}**\n└ Name: **${newPickFull.name}**`,
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                    },
                                    {
                                        name: "‎",
                                        value: "**\`\`\`js\n+ Available\`\`\`**",
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: `┌ Pick ID: **${currentPick.id}**\n└ Name: **${currentPick.name}**`,
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                    },
                                )
                            logChannel.send({ content: `${contentString}\n<@${userId}>`, embeds: [swapEmbed] });
                            await int.editReply(`You've swaped your pick! New pick: ${newPickFull.name}`);
                            while (true) {
                                try {
                                    await localFunctions.unsetParticipationOnSheet(collab, currentPick);
                                    console.log('Parcitipation unset');
                                    break;
                                } catch {
                                    console.log('Sheet update failed, retring in 2 minutes...');
                                    await localFunctions.delay(2 * 60 * 1000);
                                }
                            }
                            while (true) {
                                try {
                                    await localFunctions.setParticipationOnSheet(collab, newPickFull, userOsuDataFull.username);
                                    console.log('New pick set!');
                                    break;
                                } catch {
                                    console.log('Sheet update failed, retring in 2 minutes...');
                                    await localFunctions.delay(2 * 60 * 1000);
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
                return;
            }

            if (subcommand === "trade") {
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                try {
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    const existingTradeRequest = await localFunctions.getTradeRequest(int.user.id, collectionSpecial);
                    if (existingTradeRequest.length !== 0) {
                        return await int.reply({ content: `You cannot request a trade when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
                    }
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        try {
                            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) === "undefined") {
                                return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                            }
                        } catch {
                            return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                        }
                        const collab = openMegacollab;
                        if (collab.type === "pooled") {
                            switch (collab.status) {
                                case 'closed':
                                case 'delivered':
                                case 'early delivery':
                                case 'completed':
                                case 'archived':
                                    return int.editReply('You cannot trade your character at this collab state.');
                            }
                            let pool = collab.pool.items;
                            const pickId = int.options.getString('pick');
                            const newPickFull = pool.find(i => i.id === pickId);
                            if (typeof newPickFull === "undefined") {
                                return int.editReply('Invalid character ID!');
                            }
                            if (newPickFull.status === "available") {
                                return int.editReply('This character is available! You can swap your pick without trading.');
                            }
                            const pickRequested = newPickFull.id;

                            let participants = collab.participants;
                            const fullTraderParticipation = participants.find((e) => e.discordId === userId);
                            if (fullTraderParticipation.id === pickRequested) {
                                return int.editReply('You cannot trade to yourself silly!');
                            }

                            const fullRequestedParticipation = participants.find((e) => e.id === pickRequested);


                            const swapEmbed = new EmbedBuilder()
                                .setFooter({ text: 'Endless Mirage | New Trade Request', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                                .setColor('#f26e6a')
                                .setDescription(`**\`\`\`ml\n🎫 Trade request\`\`\`**                                                                                                        **${collab.name}**`)
                                .addFields(
                                    {
                                        name: "‎",
                                        value: "**\`\`\`ml\n- You give\`\`\`**",
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: `┌ Pick ID: **${fullRequestedParticipation.id}**\n└ Name: **${fullRequestedParticipation.name}**`,
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                    },
                                    {
                                        name: "‎",
                                        value: "**\`\`\`js\n+ You receive\`\`\`**",
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: `┌ Pick ID: **${fullTraderParticipation.id}**\n└ Name: **${fullTraderParticipation.name}**`,
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
                                    .setStyle('Success'),
                                new ButtonBuilder()
                                    .setCustomId('reject-trade')
                                    .setLabel('Reject')
                                    .setStyle('Danger'),
                            );

                            const message = await logChannel.send({ content: `<@${fullRequestedParticipation.discordId}>`, embeds: [swapEmbed], components: [components] });

                            let tradeData = {
                                'requestedUser': fullRequestedParticipation,
                                'traderUser': fullTraderParticipation,
                                'messageId': message.id,
                                'messageUrl': message.url,
                                'collabName': collab.name
                            }

                            await localFunctions.updateTradeRequest(tradeData, collectionSpecial);

                            await int.editReply(`New trade request created in <#${localConstants.logChannelID}>`);
                        }
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    mongoClientSpecial.close();
                    mongoClientUsers.close();
                    mongoClient.close();
                }
                return;
            }

            if (subcommand === "bump") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                try {
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access" || c.status === "on design"));
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
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
                        if (participation.referral) {
                            const referralCode = participation.referral;
                            const inviterUser = await localFunctions.getUserByReferral(referralCode, userCollection);
                            let currentBalance = inviterUser.balance;
                            currentBalance = currentBalance + 2000;
                            await localFunctions.setBalance(inviterUser._id, currentBalance, userCollection);
                            logChannel.send({ content: `<@${inviterUser._id}> The user ${int.user.tag} has bumped their pick and you've received **2000** tokens!`})
                        }
                        await localFunctions.addCollabBumpUser(collab.name, collection, bumps[currentBumpIndex], bumpEntry);
                        await int.editReply('You have bumped your participation succesfully');

                    }
                } finally {
                    mongoClient.close();
                    mongoClientUsers.close();
                }
            }

            if (subcommand === "pick-check") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                try {
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access" || c.status === "on design"));
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        const pickId = int.options.getString('pick');
                        const pool = openMegacollab.pool.items;
                        const pick = pool.find(i => i.id === pickId);
                        if (typeof pick === "undefined") return int.editReply('Something went wrong...');
                        if (pick.status === "picked") {
                            const pickOwner = openMegacollab.participants.find(u => parseInt(u.id) === parseInt(pickId));
                            const pickEmbed = new EmbedBuilder()
                                .setFooter({ text: "Endless Mirage | Megacollab Picks", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                                .setColor('#f26e6a')
                                .setURL('https://endlessmirage.net/')
                                .setDescription(`**\`\`\`\n🏐 ${openMegacollab.name}\`\`\`**\n**Picked by: <@${pickOwner.discordId}>**\n**Joined <t:${pickOwner.joinDate}:R>**`)
                                .addFields(
                                    {
                                        name: "‎",
                                        value: `┌ Pick: ${pick.name}\n└ ID: ${pick.id}`,
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: `┌ Series: ${pick.series}\n└ Category: ${pick.category}`,
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                                    },
                                    {
                                        name: "‎",
                                        value: `┌ Avatar Text: **${pickOwner.av_text}**\n├ Card Text: **${pickOwner.ca_text}**\n└ Card Quote: **${pickOwner.ca_quote ? pickOwner.ca_quote : "None"}**`,
                                    },
                                    {
                                        name: "‎",
                                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                                    },
                                )

                            const embed2 = new EmbedBuilder()
                                .setImage(pick.imgURL)
                                .setURL('https://endlessmirage.net/')

                            const components = new ActionRowBuilder();

                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('snipe-pick')
                                    .setLabel('🔔 Snipe')
                                    .setStyle('Success'),
                                new ButtonBuilder()
                                    .setCustomId('trade-user')
                                    .setLabel('🔁 Trade')
                                    .setStyle('Success'),
                                new ButtonBuilder()
                                    .setCustomId('report-user')
                                    .setLabel('📢 Report')
                                    .setStyle('Danger'),
                            )

                            if (guildMember.roles.cache.has('630636502187114496')) {
                                const adminComponents = new ActionRowBuilder();

                                adminComponents.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('remove-user-collab-admin')
                                        .setLabel('⛔️ Remove')
                                        .setStyle('Danger'),
                                )

                                adminComponents.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('blacklist-user-collab-admin')
                                        .setLabel('⛔️ Blacklist')
                                        .setStyle('Danger'),
                                )

                                adminComponents.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('edit-fields-user-collab-admin')
                                        .setLabel('🔄 Edit Fields')
                                        .setStyle('Primary'),
                                    new ButtonBuilder()
                                        .setCustomId('edit-pick-collab-admin')
                                        .setLabel('➰ Edit Pick')
                                        .setStyle('Primary'),
                                )
                                await int.editReply({
                                    content: '',
                                    embeds: [pickEmbed, embed2],
                                    components: [components, adminComponents]
                                });
                            } else {
                                await int.editReply({
                                    content: '',
                                    embeds: [pickEmbed, embed2],
                                    components: [components]
                                });
                            }
                            userCheckCache.set(int.user.id, {
                                collab: openMegacollab,
                                pick: pick,
                                participation: pickOwner
                            })
                        } else {
                            const pickEmbed = new EmbedBuilder()
                                .setFooter({ text: "Endless Mirage | Megacollab Picks", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                                .setColor('#f26e6a')
                                .setURL('https://endlessmirage.net/')
                                .setDescription(`**\`\`\`\n🏐 ${openMegacollab.name}\`\`\`**\n**This character hasn't been picked yet!**`)
                                .addFields(
                                    {
                                        name: "‎",
                                        value: `┌ Pick: ${pick.name}\n└ ID: ${pick.id}`,
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: `┌ Series: ${pick.series}\n└ Category: ${pick.category}`,
                                        inline: true
                                    },
                                    {
                                        name: "‎",
                                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                                    },
                                )

                            const embed2 = new EmbedBuilder()
                                .setImage(pick.imgURL)
                                .setURL('https://endlessmirage.net/')

                            const components = new ActionRowBuilder();

                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('claim-pick')
                                    .setLabel('🔑 Claim')
                                    .setStyle('Success'),
                            )

                            if (guildMember.roles.cache.has('630636502187114496')) {
                                const adminComponents = new ActionRowBuilder();
                                adminComponents.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('edit-pick-collab-admin')
                                        .setLabel('➰ Edit Pick')
                                        .setStyle('Primary'),
                                )

                                await int.editReply({
                                    content: '',
                                    embeds: [pickEmbed, embed2],
                                    components: [components, adminComponents]
                                });

                                userCheckCache.set(int.user.id, {
                                    collab: openMegacollab,
                                    pick: pick,
                                })

                            } else {
                                await int.editReply({
                                    content: '',
                                    embeds: [pickEmbed, embed2],
                                    components: [components]
                                });
                            }

                            claimCache.set(int.user.id, {
                                collab: openMegacollab,
                                pick: pick
                            })
                        }
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    mongoClient.close();
                }
                return;
            }

            if (subcommand === "user-check") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                try {
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access" || c.status === "on design"));
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        const pick = int.options.getString('user');
                        const participants = openMegacollab.participants;
                        const user = participants.find(i => i.discordId === pick);
                        const updatedPick = openMegacollab.pool.items.find(i => i.id === user.id);
                        if (typeof user === "undefined") return int.editReply('Something went wrong...');
                        const pickEmbed = new EmbedBuilder()
                            .setFooter({ text: "Endless Mirage | Megacollab Picks", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setURL('https://endlessmirage.net/')
                            .setDescription(`**\`\`\`\n🏐 ${openMegacollab.name}\`\`\`**\n**Picked by: <@${user.discordId}>**\n**Joined <t:${user.joinDate}:R>**`)
                            .addFields(
                                {
                                    name: "‎",
                                    value: `┌ Pick: ${user.name}\n└ ID: ${user.id}`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ Series: ${user.series}\n└ Category: ${user.category}`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                                },
                                {
                                    name: "‎",
                                    value: `┌ Avatar Text: **${user.av_text}**\n├ Card Text: **${user.ca_text}**\n└ Card Quote: **${user.ca_quote ? user.ca_quote : "None"}**`,
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                                },
                            )

                        const embed2 = new EmbedBuilder()
                            .setImage(updatedPick.imgURL)
                            .setURL('https://endlessmirage.net/')

                        const components = new ActionRowBuilder();

                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('snipe-pick')
                                .setLabel('🔔 Snipe')
                                .setStyle('Success'),
                            new ButtonBuilder()
                                .setCustomId('trade-user')
                                .setLabel('🔁 Trade')
                                .setStyle('Success'),
                            new ButtonBuilder()
                                .setCustomId('report-user')
                                .setLabel('📢 Report')
                                .setStyle('Danger'),
                        )

                        if (guildMember.roles.cache.has('630636502187114496')) {
                            const adminComponents = new ActionRowBuilder();

                            adminComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('remove-user-collab-admin')
                                    .setLabel('⛔️ Remove')
                                    .setStyle('Danger'),
                            )

                            adminComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('blacklist-user-collab-admin')
                                    .setLabel('⛔️ Blacklist')
                                    .setStyle('Danger'),
                            )

                            adminComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('edit-fields-user-collab-admin')
                                    .setLabel('🔄 Edit Fields')
                                    .setStyle('Primary'),
                            )

                            adminComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('edit-pick-collab-admin')
                                    .setLabel('➰ Edit Pick')
                                    .setStyle('Primary'),
                            )
                            await int.editReply({
                                content: '',
                                embeds: [pickEmbed, embed2],
                                components: [components, adminComponents]
                            });
                        } else {
                            await int.editReply({
                                content: '',
                                embeds: [pickEmbed, embed2],
                                components: [components]
                            });
                        }
                        userCheckCache.set(int.user.id, {
                            collab: openMegacollab,
                            pick: updatedPick,
                            participation: user
                        })
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    mongoClient.close();
                }
                return;
            }

            if (subcommand === "snipe") {
                const pick = int.options.getString('pick');
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
                try {
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    const existingTradeRequest = await localFunctions.getTradeRequest(int.user.id, collectionSpecial);
                    if (existingTradeRequest.length !== 0) {
                        return await int.reply({ content: `You cannot snipe a pick when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
                    }
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access" || c.status === "on design"));
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        try {
                            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) === "undefined") {
                                return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                            }
                        } catch {
                            return int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                        }
                        const newPickFull = openMegacollab.pool.items.find(i => i.id === pick);
                        if (newPickFull.status === "available") {
                            return int.editReply('This character is available! You can swap your pick.');
                        }
                        if (typeof openMegacollab.snipes !== "undefined") {
                            if (typeof openMegacollab.snipes.find(s => s.userId === userId && s.pick === pick) !== "undefined") {
                                return int.editReply('You already have a snipe for this character.')
                            }
                        }
                        const pickRequested = newPickFull.id;
                        let participants = openMegacollab.participants;
                        const fullTraderParticipation = participants.find((e) => e.discordId === userId);
                        if (fullTraderParticipation.id === pickRequested) {
                            return int.editReply('You cannot snipe yourself silly!');
                        }
                        const snipe = {
                            pick: pick,
                            userId: int.user.id
                        }
                        await localFunctions.addCollabSnipe(openMegacollab.name, collection, snipe);
                        await int.editReply('A notification if this pick becomes available will be sent to you! If the character becomes available and it gets picked by someone else, your would need to run this command again to get another notification.');
                    }
                } finally {
                    mongoClient.close();
                    mongoClientUsers.close();
                    mongoClientSpecial.close();
                }
            }
        }
    },
    createCollabCache: createCollabCache,
    claimCache: claimCache,
    userCheckCache: userCheckCache,
    adminCache: adminCache
}