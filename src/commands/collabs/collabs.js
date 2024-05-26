const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { v2, tools } = require('osu-api-extended');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { parse } = require('dotenv');
const createCollabCache = new Map();
const claimCache = new Map();

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
        .addSubcommand((subcommand) =>
            subcommand.setName("admin-link")
                .setDescription('(Admin Only) Links an account instantly.')
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
                    subcommand.setName("check")
                        .setDescription('Check a character status. (Megacollab only)')
                        .addStringOption(option =>
                            option.setName('pick')
                                .setDescription('Pick name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const subcommand = int.options.getSubcommand();
        const subcommandGroup = int.options.getSubcommandGroup();
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
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

        if (subcommand === "link") {
            const components = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('link-osu')
                    .setLabel('🔗 Link your osu! Account')
                    .setStyle('Success'),
            )
            return await int.editReply({
                content: 'Link your account using the button bellow.',
                components: [components]
            });
        }

        if (subcommand === "admin-link") {
            if (userId !== '687004886922952755') {
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
                    console.log(userTier);
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
                            value: `┌ Username: **${userOsu.username}**\n├ Country: **${tools.country(userOsu.country_code)}**\n├ Rank: **${userOsu.statistics.global_rank}**\n├ Peak Rank: **${userOsu.rank_highest.rank}**\n└ Level: **${userOsu.statistics.level.current}**`,
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
                console.log(currentDate - lastUpdate)
                if (!lastUpdate || (currentDate - lastUpdate) > 7 * 24 * 60 * 60 * 1000) {
                    buttons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('🔄 Update your data')
                            .setCustomId('refresh-osu-data')
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
        }

        if (subcommand === "manage") {
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
                    console.log(userTier);
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
                    if (((collab.status !== "closed" && collab.status !== "on design" && collab.status !== "full")) && typeof collabData.find(e => e.collabName === collab.name) === "undefined") {
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
                                if ((collab.status === "early access" && typeof userPerks.find(e => e.name === "Megacollab Early Access")) || userId === '687004886922952755') {
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
        }

        if (subcommandGroup === "quick") {
            if (subcommand === "join") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection: blacklistCollection, client: mongoClientBlacklist } = await connectToMongoDB("Blacklist");
                try {
                    const currentDate = Math.floor(new Date().getTime() / 1000);
                    const blacklistCheck = await localFunctions.getBlacklist(int.user.id, blacklistCollection)
                    if (blacklistCheck) return await int.editReply('You\'re blacklisted from all collabs and cannot participate...');
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    let openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        try {
                            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) !== "undefined") {
                                return await int.editReply('You\'re already participating on this collab! To edit your pick use the ``/collabs manage`` command.');
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
                            return await int.editReply({
                                content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                                components: [components]
                            });
                        }
                        if (int.options.getString('avatar_text').length > openMegacollab.fieldRestrictions.av) return await int.editReply(`The character limit for the avatar is of ${openMegacollab.fieldRestrictions.av} characters!`);
                        if (int.options.getString('banner_text').length > openMegacollab.fieldRestrictions.ca) return await int.editReply(`The character limit for the banner is of ${openMegacollab.fieldRestrictions.ca} characters!`);
                        if (int.options.getString('banner_quote') !== null) {
                            if (int.options.getString('banner_quote').length > openMegacollab.fieldRestrictions.ca_quote) return await int.editReply(`The character limit for the quote is of ${openMegacollab.fieldRestrictions.ca_quote} characters!`);
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
                                    return await int.editReply(`The collab is currently locked to prevent ratelimit! Please try to join again <t:${openMegacollab.lockSystem.current.time + openMegacollab.lockSystem.timeout * 60}:R>`);
                                }
                                console.log(currentDate);
                                console.log(currentDate + openMegacollab.lockSystem.timeout * 60);
                                console.log(openMegacollab.lockSystem.current.time);
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
                        console.log(pick);
                        openMegacollab = await localFunctions.getCollab(openMegacollab.name, collection);
                        if (typeof pick === 'string' && /^\d+$/.test(pick)) {
                            fullPick = await openMegacollab.pool.items.find(i => i.id === pick);
                        } else {
                            pick.split('-')[0].trim();
                            fullPick = await openMegacollab.pool.items.find(i => i.name === pick);
                        }
                        console.log(fullPick.id);
                        if (fullPick.status === "picked") {
                            return await int.editReply('This character got picked while you were selecting...');
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
                            console.log(prestige);
                            prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                            console.log(prestigeLevel);
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
                            bump_imune: tier ? true : false
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
                        await int.editReply(`You've joined the collab succesfully! Pick: ${fullPick.name}\nYour participation should appear on the spreadsheet shortly. If it is not the case, issue the \`\`/collabs manage\`\` command, select the megacollab and use the update spreadsheet button!`);
                        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
                        const joinEmbed = new EmbedBuilder()
                            .setFooter({ text: 'Endless Mirage | New Collab Participant', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setURL('https://endlessmirage.net/')
                            .setThumbnail(userOsuDataFull.avatar_url)
                            .setDescription(`**\`\`\`ml\n🎫 New Collab Participation!\`\`\`**                                                                                    **${openMegacollab.name}**`)
                            .addFields(
                                {
                                    name: "osu! info",
                                    value: `┌ User: **${userOsuDataFull.username}**\n├ Country: **${userOsuDataFull.country_code}**\n├ Rank: **#${userOsuDataFull.statistics.global_rank}**\n├ Peak: **#${userOsuDataFull.rank_highest.rank}**\n└ Mode: **${userOsuDataFull.playmode}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ PP: **${userOsuDataFull.statistics.pp}pp**\n├ Level: **${userOsuDataFull.statistics.level.current}**\n├ Playcount: **${userOsuDataFull.statistics.play_count}**\n├ Playtime: **${Math.floor(userOsuDataFull.statistics.play_time / 3600)}h **\n└ Followers: **${userOsuDataFull.follower_count}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                }
                            )
                        try {
                            joinEmbed.addFields(
                                {
                                    name: "Analytics",
                                    value: `┌ ACC: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].int : "..."}**\n├ REA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].int : "..."}**\n├ ${userOsuDataFull.skillRanks[2].skill === "Aim" ? "AIM" : "CON"}: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].int : "..."}**\n├ SPD: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].int : "..."}**\n├ STA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].int : "..."}**\n└ PRE: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].int : "..."}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ Top 1 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[0].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[0].percentage) : "..."}%**\n├ Top 2 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[1].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[1].percentage) : "..."}%**\n├ Top 3 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[2].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[2].percentage) : "..."}%**\n├ Top 4 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[3].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[3].percentage) : "..."}%**\n└ Combination: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.mostCommonModCombination.combination : "..."}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                },
                            )
                        } catch {
                            joinEmbed.addFields(
                                {
                                    name: "Analytics",
                                    value: `There was some error trying to get your analytics... Please try updaging them on your collabs profile command.`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                },
                            )
                        }
                        joinEmbed.addFields(
                            {
                                name: "General info",
                                value: `┌ Pick ID: **${fullPick.id}**\n├ Name: **${fullPick.name}**\n└ Series: **${fullPick.series}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: `┌ Category: **${fullPick.category}**\n├ Premium Tier: **${tier}**\n└ Prestige Level: **${prestigeLevel}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            },
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
                                await localFunctions.delay(2*60*1000);
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    mongoClient.close();
                    mongoClientUsers.close();
                    mongoClientBlacklist.close();
                }
            }

            if (subcommand === "join-random") {
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection: blacklistCollection, client: mongoClientBlacklist } = await connectToMongoDB("Blacklist");
                try {
                    const currentDate = Math.floor(new Date().getTime() / 1000);
                    const blacklistCheck = await localFunctions.getBlacklist(int.user.id, blacklistCollection)
                    if (blacklistCheck) return await int.editReply('You\'re blacklisted from all collabs and cannot participate...');
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    let openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        try {
                            if (typeof userCollabs.find(uc => uc.collabName === openMegacollab.name) !== "undefined") {
                                return await int.editReply('You\'re already participating on this collab! To edit your pick use the ``/collabs manage`` command.');
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
                            return await int.editReply({
                                content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                                components: [components]
                            });
                        }
                        if (int.options.getString('avatar_text').length > openMegacollab.fieldRestrictions.av) return await int.editReply(`The character limit for the avatar is of ${openMegacollab.fieldRestrictions.av} characters!`);
                        if (int.options.getString('banner_text').length > openMegacollab.fieldRestrictions.ca) return await int.editReply(`The character limit for the banner is of ${openMegacollab.fieldRestrictions.ca} characters!`);
                        if (int.options.getString('banner_quote') !== null) {
                            if (int.options.getString('banner_quote').length > openMegacollab.fieldRestrictions.ca_quote) return await int.editReply(`The character limit for the quote is of ${openMegacollab.fieldRestrictions.ca_quote} characters!`);
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
                                    return await int.editReply(`The collab is currently locked to prevent ratelimit! Please try to join again <t:${openMegacollab.lockSystem.current.time + openMegacollab.lockSystem.timeout * 60}:R>`);
                                }
                                console.log(currentDate);
                                console.log(currentDate + openMegacollab.lockSystem.timeout * 60);
                                console.log(openMegacollab.lockSystem.current.time);
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
                            console.log(idCheck);
                            fullPick = openMegacollab.pool.items[idCheck];
                            if (fullPick.status !== "picked") {
                                pick = fullPick.id;
                                console.log(fullPick);
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
                            console.log(prestige);
                            prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                            console.log(prestigeLevel);
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
                            bump_imune: tier ? true : false
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
                        await int.editReply(`You've joined the collab succesfully! Pick: ${fullPick.name}\nYour participation should appear on the spreadsheet shortly. If it is not the case, issue the \`\`/collabs manage\`\` command, select the megacollab and use the update spreadsheet button!`);
                        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
                        const joinEmbed = new EmbedBuilder()
                            .setFooter({ text: 'Endless Mirage | New Collab Participant', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setURL('https://endlessmirage.net/')
                            .setThumbnail(userOsuDataFull.avatar_url)
                            .setDescription(`**\`\`\`ml\n🎫 New Collab Participation!\`\`\`**                                                                                    **${openMegacollab.name}**`)
                            .addFields(
                                {
                                    name: "osu! info",
                                    value: `┌ User: **${userOsuDataFull.username}**\n├ Country: **${userOsuDataFull.country_code}**\n├ Rank: **#${userOsuDataFull.statistics.global_rank}**\n├ Peak: **#${userOsuDataFull.rank_highest.rank}**\n└ Mode: **${userOsuDataFull.playmode}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ PP: **${userOsuDataFull.statistics.pp}pp**\n├ Level: **${userOsuDataFull.statistics.level.current}**\n├ Playcount: **${userOsuDataFull.statistics.play_count}**\n├ Playtime: **${Math.floor(userOsuDataFull.statistics.play_time / 3600)}h **\n└ Followers: **${userOsuDataFull.follower_count}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                }
                            )
                        try {
                            joinEmbed.addFields(
                                {
                                    name: "Analytics",
                                    value: `┌ ACC: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].int : "..."}**\n├ REA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].int : "..."}**\n├ ${userOsuDataFull.skillRanks[2].skill === "Aim" ? "AIM" : "CON"}: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].int : "..."}**\n├ SPD: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].int : "..."}**\n├ STA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].int : "..."}**\n└ PRE: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].int : "..."}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: `┌ Top 1 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[0].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[0].percentage) : "..."}%**\n├ Top 2 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[1].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[1].percentage) : "..."}%**\n├ Top 3 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[2].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[2].percentage) : "..."}%**\n├ Top 4 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[3].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[3].percentage) : "..."}%**\n└ Combination: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.mostCommonModCombination.combination : "..."}**`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                },
                            )
                        } catch {
                            joinEmbed.addFields(
                                {
                                    name: "Analytics",
                                    value: `There was some error trying to get your analytics... Please try updaging them on your collabs profile command.`,
                                    inline: true
                                },
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                },
                            )
                        }
                        joinEmbed.addFields(
                            {
                                name: "General info",
                                value: `┌ Pick ID: **${fullPick.id}**\n├ Name: **${fullPick.name}**\n└ Series: **${fullPick.series}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: `┌ Category: **${fullPick.category}**\n├ Premium Tier: **${tier}**\n└ Prestige Level: **${prestigeLevel}**`,
                                inline: true
                            },
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            },
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
                                await localFunctions.delay(2*60*1000);
                            }
                        }

                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    mongoClient.close();
                    mongoClientUsers.close();
                    mongoClientBlacklist.close();
                }
            }

            if (subcommand == "swap") {
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
                                return await int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                            }
                        } catch {
                            return await int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                        }
                        const collab = openMegacollab;
                        if (collab.type === "pooled") {
                            switch (collab.status) {
                                case 'full':
                                    return await int.editReply('This collab is full! There is no character to swap with. Try trading!');
                                case 'closed':
                                case 'delivered':
                                case 'early delivery':
                                case 'completed':
                                case 'archived':
                                    return await int.editReply('You cannot swap your character at this collab state.');
                            }

                            let pool = collab.pool.items;
                            const pickId = int.options.getString('pick');
                            const newPickFull = pool.find(i => i.id === pickId);
                            if (typeof newPickFull === "undefined") {
                                return await int.editReply('Invalid character ID!');
                            }
                            if (newPickFull.status === "picked") {
                                return await int.editReply('This character has already been picked!');
                            }
                            const pick = newPickFull.id;
                            const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                            const userCollab = userCollabs.find(e => e.collabName === collab.name);
                            const currentPick = pool.find((e) => e.id === userCollab.collabPick.id);
                            const userOsuDataFull = await localFunctions.getOsuData(userId, userCollection);
                            await localFunctions.unsetCollabParticipation(collab.name, collection, currentPick.id);
                            await localFunctions.setCollabParticipation(collab.name, collection, pick);
                            await localFunctions.editCollabParticipantPickOnCollab(collab.name, userId, newPickFull, collection);
                            await localFunctions.editCollabParticipantPickOnUser(userId, collab.name, newPickFull, userCollection);

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
                            logChannel.send({ content: `<@${userId}>`, embeds: [swapEmbed] });
                            await int.editReply(`You've swaped your pick! New pick: ${newPickFull.name}`);
                            while (true) {
                                try {
                                    await localFunctions.unsetParticipationOnSheet(collab, currentPick);
                                    console.log('Parcitipation unset');
                                    break;
                                } catch {
                                    console.log('Sheet update failed, retring in 2 minutes...');
                                    await localFunctions.delay(2*60*1000);
                                }
                            }
                            while (true) {
                                try {
                                    await localFunctions.setParticipationOnSheet(collab, newPickFull, userOsuDataFull.username);
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

            if (subcommand == "trade") {
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
                                return await int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                            }
                        } catch {
                            return await int.editReply('You\'re not participating on this collab! To join use the ``/collabs quick join`` command.');
                        }
                        const collab = openMegacollab;
                        if (collab.type === "pooled") {
                            switch (collab.status) {
                                case 'closed':
                                case 'delivered':
                                case 'early delivery':
                                case 'completed':
                                case 'archived':
                                    return await int.editReply('You cannot trade your character at this collab state.');
                            }
                            let pool = collab.pool.items;
                            const pickId = int.options.getString('pick');
                            const newPickFull = pool.find(i => i.id === pickId);
                            if (typeof newPickFull === "undefined") {
                                return await int.editReply('Invalid character ID!');
                            }
                            if (newPickFull.status === "available") {
                                return await int.editReply('This character is available! You can swap your pick without trading.');
                            }
                            const pickRequested = newPickFull.id;

                            let participants = collab.participants;
                            const fullTraderParticipation = participants.find((e) => e.discordId === userId);
                            if (fullTraderParticipation.id === pickRequested) {
                                return await int.editReply('You cannot trade to yourself silly!');
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
            }

            if (subcommand == "check") {
                const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
                const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                try {
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access"));
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        const pickId = int.options.getString('pick');
                        const pool = openMegacollab.pool.items;
                        const pick = pool.find(i => i.id === pickId);
                        if (typeof pick === "undefined") return await int.editReply('Something went wrong...');
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

                            await int.editReply({
                                content: '',
                                embeds: [pickEmbed, embed2],
                            });
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

                            claimCache.set(int.user.id, {
                                collab: openMegacollab,
                                pick: pick
                            })

                            await int.editReply({
                                content: '',
                                embeds: [pickEmbed, embed2],
                                components: [components]
                            });
                        }
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    mongoClientUsers.close();
                    mongoClient.close();
                }
            }
        }
    },
    createCollabCache: createCollabCache,
    claimCache: claimCache
}