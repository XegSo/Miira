const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { v2, tools } = require('osu-api-extended');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const createCollabCache = new Map();

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
                            option.setName('av_text')
                                .setDescription('Text for the avatar')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('ca_text')
                                .setDescription('Text for the banner')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('ca_quote')
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
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const subcommand = int.options.getSubcommand();
        const subcommandGroup = int.options.getSubcommandGroup();
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
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
                let modsData = localFunctions.analyzeMods(userTop100);
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
                const currentDate = new Date();
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
                    let premiumDetails = await localFunctions.assignPremium(int, userId, collection, guildMember);
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
                            value: `┌ Top 1 Mod: **${userOsu.modsData.top4Mods[0].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[0].percentage)}%**\n├ Top 2 Mod: **${userOsu.modsData.top4Mods[1].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[1].percentage)}%**\n├ Top 3 Mod: **${userOsu.modsData.top4Mods[2].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[2].percentage)}%**\n├ Top 4 Mod: **${userOsu.modsData.top4Mods[3].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[3].percentage)}%**\n└ Most used combination: **${userOsu.modsData.mostCommonModCombination.combination}**`,
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
                            name: `*You can update your analytics <t:${Math.floor(lastUpdate.getTime() / 1000 + 604800)}:R>.*`,
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
                    if (((collab.status !== "closed" && collab.status !== "on design") || userId === '687004886922952755') && typeof collabData.find(e => e.collabName === collab.name) === "undefined") {
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
                        osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Seems like you can join some collab!*`);
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

        if (subcommand === "join") {
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
                const collabs = await localFunctions.getCollabs(collabCollection);

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
                    let premiumDetails = await localFunctions.assignPremium(int, userId, collection, guildMember);
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
                    if (((collab.status !== "closed" && collab.status !== "on design" && collab.status !== "full") || userId === '687004886922952755') && typeof collabData.find(e => e.collabName === collab.name) === "undefined") {
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
                try {
                    const allCollabs = await localFunctions.getCollabs(collection);
                    const userCollabs = await localFunctions.getUserCollabs(int.user.id, userCollection);
                    if (typeof userCollabs.find(uc => allCollabs.find(c => c.name === uc.collabName)) !== "undefined") {
                        return await int.editReply('You\'re already participating on this collab! To edit your pick use the ``/collabs manage`` command.');
                    }
                    const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                    if (typeof openMegacollab === "undefined") {
                        await int.editReply('There is no open megacollabs at the moment...')
                    } else {
                        const availablePicks = openMegacollab.pool.items.filter(i => i.status === "available");
                        const pick = int.options.getString('pick');
                        console.log(pick);
                        const fullPick = availablePicks.find(i => i.id === pick);
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
                                let premiumDetails = await localFunctions.assignPremium(int, userId, userCollection, guildMember);
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
                        const currentDate = Math.floor(new Date().getTime() / 1000);
                        let userOsuData = localFunctions.flattenObject(userOsuDataFull);
                        const userParticipant = {
                            discordId: userId,
                            discordTag: int.user.tag,
                            joinDate: currentDate,
                            av_text: int.options.getString('av_text'),
                            ca_text: int.options.getString('ca_text'),
                            ca_quote: int.options.getString('ca_quote') ? int.options.getString('ca_quote') : "",
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
                            av_text: int.options.getString('av_text'),
                            ca_text: int.options.getString('ca_text'),
                            ca_quote: int.options.getString('ca_quote') ? int.options.getString('ca_quote') : "",
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
                        await localFunctions.setParticipationOnSheet(openMegacollab, fullPick, userOsuDataFull.username);
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    mongoClient.close();
                    mongoClientUsers.close();
                }
            }
            
            if (subcommand == "swap") {
                await int.editReply('This function is WIP!')
            }

            if (subcommand == "trade") {
                await int.editReply('This function is WIP!')
            }
        }
    },
    createCollabCache: createCollabCache
}