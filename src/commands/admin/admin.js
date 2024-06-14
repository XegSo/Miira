const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { v2 } = require('osu-api-extended');
const monthlySupporterCache = new Map();
const adminCache = new Map();
const givePerksCache = new Map();
const giveTierCache = new Map();
const removePerksCache = new Map();


module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup((subcommandGroup) =>
            subcommandGroup
                .setName('server')
                .setDescription('Admin server commands.')
                .addSubcommand((subcommand) =>
                    subcommand.setName('global-boost')
                        .setDescription('Sets a global boost for the obtained tokens in a given amount of time.')
                        .addStringOption(option =>
                            option
                                .setName('multiplier')
                                .setDescription('Multiplier')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option
                                .setName('timer')
                                .setDescription('Time in hours')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('give-tokens')
                        .setDescription('Assign credits to a user.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setDescription('User to assign credis to')
                                .setRequired(true)
                        )
                        .addIntegerOption(option =>
                            option
                                .setName('amount')
                                .setDescription('Amount of credits to assign')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('ticket-create')
                        .setDescription('Create a ticket system.')
                        .addStringOption(option =>
                            option
                                .setName('channelid')
                                .setDescription('Insert the channel ID for the embed')
                                .setRequired(true)
                        ),
                )
        )
        .addSubcommandGroup((subcommandGroup) =>
            subcommandGroup
                .setName('collabs')
                .setDescription('Admin collab commands.')
                .addSubcommand((subcommand) =>
                    subcommand.setName('manage')
                        .setDescription('Open the collabs Admin Collabs Dashboard.')
                        .addStringOption(option =>
                            option.setName('collab')
                                .setDescription('Collab name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('blacklist')
                        .setDescription('Add an user to the blacklist.')
                        .addStringOption(option =>
                            option
                                .setName('user')
                                .setDescription('User ID')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option
                                .setName('osuid')
                                .setDescription('osu! ID')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option
                                .setName('reason')
                                .setDescription('Reason')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('set-bumps')
                        .setDescription('Setup bumps for megacollabs.')
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('give-perks')
                        .setDescription('Give perks to a user.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setDescription('User to assign the perks.')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('give-tier')
                        .setDescription('Remove a tier from a user.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setDescription('User to assign the tier.')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('remove-perks')
                        .setDescription('Remove perks from a user.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setDescription('User to remove the perks.')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('remove-tier')
                        .setDescription('Give a tier to a user.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setDescription('User to remove the tier.')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('premium-embed')
                        .setDescription('Creates the embeds for the premium channel.')
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('premium-check')
                        .setDescription('Check the premium dashboard of a user.')
                        .addUserOption(option =>
                            option
                                .setName('user')
                                .setDescription('User to check')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('set-decay')
                        .setDescription('Set the premium decay date.')
                        .addIntegerOption(option =>
                            option
                                .setName('decaydate')
                                .setDescription('Decay date in UNIX epoch.')
                                .setRequired(true)
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('set-prestige')
                        .setDescription('Set prestige after megacollab.')
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName('link')
                        .setDescription('Links an account instantly.')
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
                                    { name: 'taiko', value: 'taiko' }
                                )
                        )
                )
        ),
    async execute(int, client) {
        await int.deferReply();
        const subcommand = int.options.getSubcommand();
        const subcommandGroup = int.options.getSubcommandGroup();
        const userId = int.user.id;
        const guild = await client.guilds.cache.get(localConstants.guildId);
        const guildMember = await guild.members.cache.get(userId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        const collection = client.db.collection('OzenCollection');
        const collabCollection = client.db.collection('Collabs');
        const collectionSpecial = client.db.collection('Special');
        const blacklistCollection = client.db.collection('Blacklist');

        if (subcommandGroup === 'server') {
            if (subcommand === 'global-boost') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const multiplier = parseFloat(int.options.getString('multiplier'));
                const boostDuration = parseFloat(int.options.getString('timer'));

                if (isNaN(multiplier) || isNaN(boostDuration)) {
                    int.editReply('Please provide valid numerical values for multiplier and timer.');
                    return;
                }

                await localFunctions.applyGlobalBoost(multiplier, boostDuration, client);
                await int.editReply(`Global boost of ${multiplier}x for ${boostDuration} hours has been applied.`);
                return;
            }
            if (subcommand === 'give-tokens') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');

                // Check if the command has the required arguments/options
                const userId = int.options.getUser('user');
                const amount = int.options.getInteger('amount');

                // Fetch user's balance from the database
                const currentBalance = await localFunctions.getBalance(userId.id, collection);
                const newBalance = currentBalance + amount;
                await localFunctions.setBalance(userId.id, newBalance, collection);
                await int.editReply(`Assigned ${amount} credits to user <@${userId.id}>.`);
                return;
            }
            if (subcommand === 'ticket-create') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const channel = int.guild.channels.cache.get(int.options.getString('channelid'));

                if (!channel) {
                    await int.editReply('Please provide a channel Id.');
                    return;
                }
                const TicketTopEmbed = new EmbedBuilder()
                    .setColor('#f26e6a')
                    .setImage('https://puu.sh/JPEsp/c792ff3de7.png');
                const TicketEmbed = new EmbedBuilder()
                    .setColor('#f26e6a')
                    .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                    .setTitle('Contact staff via Ticket.')
                    .setDescription('Click on the button bellow to contact staff to discuss any matter on a private channel. Keep in mind rules still apply on there.');
                await channel.send({
                    content: '',
                    embeds: [TicketTopEmbed, TicketEmbed],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('create-ticket')
                                .setLabel('🎫 Create a Ticket.')
                                .setStyle('Primary')
                        )
                    ]
                });
                await int.editReply('Embed created succesfully');
                return;
            }
        }

        if (subcommandGroup === 'collabs') {
            if (subcommand === 'manage') {
                try {
                    let collab = await localFunctions.getCollab(int.options.getString('collab'), collabCollection);
                    let components = [];
                    let extraComponents = [];
                    let URLstring = '';
                    if (typeof collab.spreadsheetID !== 'undefined') {
                        URLstring = `  [Spreadsheet URL](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})\n`;
                    }
                    const dashboardEmbed = new EmbedBuilder()
                        .setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                        .setColor('#f26e6a')
                        .setDescription(`**\`\`\`ml\n🧱 Endless Mirage | Admin Collabs Dashboard\`\`\`**\n**${collab.name}**\n${URLstring}`);

                    let extraString = '';

                    if (collab.user_cap !== 0) {
                        extraString = `User Limit: ${collab.user_cap}\n`;
                    } else {
                        extraString = 'Unlimited\n';
                    }

                    dashboardEmbed.addFields(
                        {
                            name: '‎',
                            value: `┌ Type: ${localFunctions.capitalizeFirstLetter(collab.type)}\n├ Topic: ${localFunctions.capitalizeFirstLetter(collab.topic)}\n└ Status: ${localFunctions.capitalizeFirstLetter(collab.status)}\n`,
                            inline: true
                        }
                    );

                    dashboardEmbed.addFields(
                        {
                            name: '‎',
                            value: `┌ Class: ${localFunctions.capitalizeFirstLetter(collab.restriction)}\n├ Opening date: <t:${parseInt(collab.opening)}:R>\n└ ${extraString}`,
                            inline: true
                        }
                    );

                    dashboardEmbed.addFields(
                        {
                            name: '‎',
                            value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                        }
                    );

                    if (int.user.id === collab.host) {
                        components = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('edit-collab')
                                .setLabel('✏️ Edit')
                                .setStyle('Primary')
                        );
                        if (collab.type === 'pooled') {
                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('pool-collab')
                                    .setLabel('📁 Pool')
                                    .setStyle('Primary')
                            );
                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('manage-pick-collab')
                                    .setLabel('🔩 Picks')
                                    .setStyle('Primary')
                            );
                        }

                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('reset-collab')
                                .setLabel('🔁 Reset')
                                .setStyle('Danger')
                        );

                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('delete-collab')
                                .setLabel('🚮 Delete')
                                .setStyle('Danger')
                        );

                        if (collab.status !== 'on design' || int.user.id === '687004886922952755') {
                            extraComponents = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('export-collab')
                                    .setLabel('⬇️ Export')
                                    .setStyle('Success')
                            );
                            if (typeof collab.perks !== 'undefined') {
                                extraComponents.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('export-collab-perks')
                                        .setLabel('⬇️ Perks')
                                        .setStyle('Success')
                                );
                            }
                            extraComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('deliver-collab')
                                    .setLabel('⬆️ Deliver')
                                    .setStyle('Success')
                            );
                            await int.editReply({
                                content: '',
                                embeds: [dashboardEmbed],
                                components: [components, extraComponents]
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
                                .setStyle('Primary')
                        );
                        if (collab.status !== 'on design') {
                            extraComponents = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('export-collab')
                                    .setLabel('⬇️ Export')
                                    .setStyle('Success')
                            );
                        }
                    }

                    adminCache.set(int.user.id, {
                        collab: collab
                    });

                } catch (e) {
                    console.log(e);
                    await int.editReply('Something went wrong...');
                }
                return;
            }

            if (subcommand === 'set-bumps') {
                const currentDate = Math.floor(Date.now() / 1000);
                const allCollabs = await localFunctions.getCollabs(collabCollection);
                const openMegacollab = allCollabs.find(c => c.restriction === 'megacollab' && (c.status === 'open' || c.status === 'early access' || c.status === 'on design'));

                if (typeof openMegacollab === 'undefined') {
                    await int.editReply('There is no open megacollabs at the moment...');
                } else {
                    const collab = openMegacollab;
                    let bumps = collab.bumps;
                    const dashboardEmbed = new EmbedBuilder()
                        .setFooter({ text: 'Endless Mirage | Bumps Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                        .setColor('#f26e6a')
                        .setDescription(`**\`\`\`ml\n🧱 Endless Mirage | Admin Bump Dashboard\`\`\`**\n**${collab.name}**`);
                    if (typeof bumps === 'undefined') {
                        dashboardEmbed.addFields(
                            {
                                name: '‎',
                                value: 'There are no bumps for this collab yet...'
                            },
                            {
                                name: '‎',
                                value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                            }
                        );
                        const components = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('start-bump')
                                .setLabel('New Bump')
                                .setStyle('Success')
                        );

                        int.editReply({ embeds: [dashboardEmbed], components: [components] });

                    } else {
                        let i = 1;
                        for (const bump of bumps) {
                            dashboardEmbed.addFields(
                                {
                                    name: '‎',
                                    value: `Bump #${i}\n- **Starting Date:** ${bump.startingDate}\n- **Duration:** ${bump.days} days`
                                }
                            );
                        }
                        dashboardEmbed.addFields(
                            {
                                name: '‎',
                                value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                            }
                        );
                        const latestBumpIndex = bumps.length - 1;
                        if (currentDate - bumps[latestBumpIndex].startingDate > bumps[latestBumpIndex].days * 24 * 60 * 60 && bumps.length !== 4) {
                            const components = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('start-bump')
                                    .setLabel('New Bump')
                                    .setStyle('Success')
                            );

                            int.editReply({ embeds: [dashboardEmbed], components: [components] });
                        } else if (bumps.length !== 4) {
                            const components = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('stop-bump')
                                    .setLabel('Stop Bump')
                                    .setStyle('Danger')
                            );

                            int.editReply({ embeds: [dashboardEmbed], components: [components] });
                        } else {
                            const components = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('filter-bump')
                                    .setLabel('Filter Users')
                                    .setStyle('Primary')
                            );

                            int.editReply({ embeds: [dashboardEmbed], components: [components] });
                        }

                    }
                }
                return;
            }

            if (subcommand === 'give-perks') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const user = int.options.getUser('user');
                const perkMenu = new SelectMenuBuilder()
                    .setCustomId('set-perks')
                    .setPlaceholder('Select the perks.')
                    .setMinValues(1)
                    .setMaxValues(17);

                localConstants.premiumTiers.forEach((tier) => {
                    tier.perks.forEach((perk) => {
                        perkMenu.addOptions({ label: perk.name, value: perk.name, description: `${tier.name} perk` });
                    });
                });

                givePerksCache.set(int.user.id, {
                    user: user
                });

                const row = new ActionRowBuilder().addComponents(perkMenu);

                await int.editReply({
                    components: [row]
                });
                return;
            }

            if (subcommand === 'give-tier') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const userId = int.options.getUser('user');
                const tierMenu = new SelectMenuBuilder()
                    .setCustomId('set-tier')
                    .setPlaceholder('Select the tier.');

                localConstants.premiumTiers.forEach((tier) => {
                    tierMenu.addOptions({ label: tier.name, value: tier.name, description: `${tier.name}` });
                });

                giveTierCache.set(int.user.id, {
                    user: userId
                });

                const row = new ActionRowBuilder().addComponents(tierMenu);

                await int.editReply({
                    components: [row]
                });
                return;
            }

            if (subcommand === 'remove-perks') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const user = int.options.getUser('user');
                const perkMenu = new SelectMenuBuilder()
                    .setCustomId('remove-perks')
                    .setPlaceholder('Select the perks.')
                    .setMinValues(1);

                const userPerks = await localFunctions.getPerks(user.id, collection);

                if (userPerks.length === 0) {
                    await int.editReply('The user has no perks in the database.');
                    return;
                }

                userPerks.forEach((perk) => {
                    perkMenu.addOptions({ label: perk.name, value: perk.name, description: `${perk.name}` });
                });

                removePerksCache.set(int.user.id, { user });
                perkMenu.setMaxValues(perkMenu.options.length);
                const row = new ActionRowBuilder().addComponents(perkMenu);

                await int.editReply({
                    components: [row]
                });
                return;
            }

            if (subcommand === 'remove-tier') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const user = int.options.getUser('user');
                try {
                    await localFunctions.delTier(user.id, collection);
                    console.log(`Tier removed for user ${user.tag}`);
                } catch (e) {
                    console.log(e);
                }

                await int.editReply(`Tier removed for user ${user.tag}`);
                return;
            }

            if (subcommand === 'premium-embed') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const premiumChannel = int.guild.channels.cache.get('767374005782052864');
                const mainEmbed = new EmbedBuilder()
                    .setColor('#f26e6a')
                    .setDescription('**```ml\n 🚀 Welcome to the premium section!```**\n**In this section, you can find information about the current premium tiers and their perks!**\n\n**• The perks are ACCUMULATIVE.** \n**• After one collab, most perks will need to be RENEWED.** \n**• If there is no renewal, there is a DECAY into former supporter.**\n**• You can also purchase SINGLE PERKS for single use in collabs.**\n**• Premium includes bump immunity.**\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>')
                    .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' });
                let tierEmbeds = [];
                let deluxeEntry = 'Free.';
                let deluxeExtra = 'Free.';
                let renewalPrice = 'No.';
                let resString = '\u200B';
                let priceString = '\u200B';
                let decayString = '';

                for (let tier of localConstants.premiumTiers) {

                    if (tier.decay) {
                        decayString = '\n⚠️__***This tier decays.***__';
                    } else {
                        decayString = '';
                    }

                    let tierEmbed = new EmbedBuilder()
                        .setColor('#f26e6a')
                        .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                        .setDescription(`**\`\`\`ml\n🚀 ${tier.name}\`\`\`**\n • ${tier.description}${decayString}`);

                    if (tier.generalRenewalPrice) {
                        renewalPrice = `${tier.generalRenewalPrice}$`;
                    } else {
                        renewalPrice = 'No.';
                    }

                    if (tier.deluxePrice) {
                        deluxeEntry = `${tier.deluxePrice}$`;
                        deluxeExtra = `${tier.deluxeExtraPrice}$`;
                    } else {
                        deluxeEntry = 'Free.';
                        deluxeExtra = 'Free.';
                    }

                    tierEmbed.addFields(
                        {
                            name: '‎',
                            value: '**```ml\n💵 Pricing```**\n'
                        },
                        {
                            name: '\u200B',
                            value: `• **__Price__: ${tier.cost}$**\n• **__Renewal__: ${renewalPrice}**`,
                            inline: true
                        },
                        {
                            name: '\u200B',
                            value: `• **__DX Collab Entry__: ${deluxeEntry}**\n• **__DX Extra Mats__: ${deluxeExtra}**`,
                            inline: true
                        },
                        {
                            name: '\u200B',
                            value: '\u200B',
                            inline: true
                        },
                        {
                            name: '‎                                      *└DX Stands for Deluxe Collabs*',
                            value: '**```ml\n🎫 Perks```**\n'
                        },
                        {
                            name: '*Renewing this tier renews all of the perks (Including previous tiers).*\n*You can renew individual perks or buy perks if you\'re not supporter.*\n',
                            value: '\u200B'
                        }
                    );

                    for (const perk of tier.perks) {
                        if (perk.restrictions) {
                            resString = `‎          💬__ *${perk.restrictions}*__`;
                        } else {
                            resString = '‎          💬__ *This perk has no restrictions!*__';
                        }

                        if (perk.singleUse) {
                            if (perk.renewalPrice && perk.individualPrice) {
                                priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__        └💵__ Price: ${perk.individualPrice}$__        🛑__** Single use perk.**__`;
                            } else if (perk.renewalPrice) {
                                priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__                                   🛑__** Single use perk.**__`;
                            } else if (perk.individualPrice) {
                                priceString = `\n‎        └💵__ Price: ${perk.individualPrice}$__                                       🛑__** Single use perk.**__`;
                            }
                        } else {
                            if (perk.renewalPrice && perk.individualPrice) {
                                priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__        └💵__ Price: ${perk.individualPrice}$__`;
                            } else if (perk.renewalPrice) {
                                priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__`;
                            } else if (perk.individualPrice) {
                                priceString = `\n‎        └💵__ Price: ${perk.individualPrice}$__`;
                            } else {
                                priceString = '\u200B';
                            }
                        }

                        tierEmbed.addFields(
                            {
                                name: `\`\`✒️ ${perk.name}\`\``,
                                value: `‎  • ${perk.description}${priceString}`
                            },
                            {
                                name: resString,
                                value: '‎'
                            }
                        );
                    }

                    tierEmbed.addFields({
                        name: '‎',
                        value: `**\`\`\`ml\n✅ Extras\`\`\`**\n • ${tier.extra}\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`
                    });

                    tierEmbeds.push(tierEmbed);
                }

                await premiumChannel.send({
                    embeds: [mainEmbed]
                });

                let buyComponent = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('premium-buy')
                        .setLabel('⏏️ Purchase')
                        .setStyle('Primary')
                );

                for (let embed of tierEmbeds) {
                    await premiumChannel.send({
                        embeds: [embed],
                        components: [buyComponent]
                    });
                }

                await int.editReply('Done!');
                return;
            }

            if (subcommand === 'premium-check') {
                const userId = int.options.getUser('user').id;
                let foundRole = null;
                let renewalPrice = '';
                let decayString = '';
                let tierString = '**No premium status found!**';
                let tierDetails = '';
                let newPerks = [];
                const username = int.options.getUser('user').tag;
                const member = guildMember;
                const tiers = localConstants.premiumTiers;

                const premiumEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Premium Dashboard\n', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a');

                if (!member.roles.cache.has('743505566617436301')) {
                    let userPerks = await localFunctions.getPerks(userId, collection);
                    if (userPerks.length !== 0) {
                        let useMenu = new SelectMenuBuilder()
                            .setCustomId('use-perks')
                            .setPlaceholder('Use your perks.');

                        premiumEmbed.setAuthor({ name: `Welcome to your perks dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                        premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n✅ Perks available to use!\`\`\`**`);
                        for (const perk of userPerks) {
                            premiumEmbed.addFields({
                                name: ' ',
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
                                .setStyle('Primary')
                        );
                        premiumEmbed.addFields(
                            {
                                name: '‎',
                                value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                            }
                        );
                        await int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [useComponents, buyComponents]
                        });
                    } else {
                        premiumEmbed.setDescription('**```ml\n 🚀 Welcome to the premium section!```**                                                                                                           **In this section, you can find information about the current premium tiers and their perks!**\n\n**• The perks are ACCUMULATIVE.** \n**• After one collab, most perks will need to be RENEWED.** \n**• If there is no renewal, there is a DECAY into former supporter.**\n**• You can also purchase SINGLE PERKS for single use in collabs.**\n**• Premium includes bump immunity.**');
                        premiumEmbed.addFields(
                            { name: ' ', value: '**```ml\n⚠️ Only the prominent perks are mentioned for each tier.```**' },
                            { name: ' ', value: '``🎫 Mirage I Premium | Price: 5$``\n └ Exclusive profile picture version.' },
                            { name: ' ', value: '``🎫 Mirage II Premium | Price: 10$``\n └ Animated Banner.' },
                            { name: ' ', value: '``🎫 Mirage III Premium | Price: 15$``\n └ Animated Stream Overlay.' },
                            { name: ' ', value: '``🎫 Mirage IV Premium | Price: 20$``\n └ Early collab delivery.\n' },
                            { name: ' ', value: '``🎫 Mirage V Premium | Price: 40$``\n └ Customized collab themed osu! skin.' },
                            { name: ' ', value: '``🎫 Mirage VI Premium | Price: 100$``\n └ Collab early access.' },
                            { name: ' ', value: '``🎫 Mirage VII Premium | Price: 250$``\n └ Host your own megacollab.' },
                            { name: ' ', value: '**```prolog\n💎 Find the full details about each tier in the list bellow.```\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>**' }
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
                                    { label: 'Mirage VII', value: 'Mirage VII', description: 'Cost: 250$' }
                                ])
                        );
                        await int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [defaultComponents]
                        });
                    }
                } else {
                    let userPerks = await localFunctions.getPerks(userId, collection);
                    let premiumData = await localFunctions.getPremiumData(collectionSpecial);
                    let mainComponents = [];
                    let userTier = await localFunctions.getUserTier(userId, collection);
                    if (!userTier && member.roles.cache.has('743505566617436301') && !member.roles.cache.has('1150484454071091280')) {
                        console.log('Executing insertion of perks'); // this needs to be moved into functions
                        for (const numeral of localConstants.romanNumerals) { // find the fucker and assign it to the database
                            const roleToFind = `Mirage ${numeral}`;
                            foundRole = member.roles.cache.find(role => role.name === roleToFind);

                            if (foundRole) {
                                let tierNumber = localFunctions.romanToInteger(numeral);
                                const foundTier = {
                                    name: foundRole.name,
                                    id: foundRole.id
                                };
                                await localFunctions.setUserTier(userId, foundTier, collection);
                                userTier = foundTier;
                                tierString = `**Current Tier: ${foundTier.name}**`;
                                tierDetails = localConstants.premiumTiers.find(tier => tier.name === foundRole.name);
                                if (tierNumber > 3) { // for non renewable fuck, assign the non renewable fuckers
                                    for (const tier of tiers) {
                                        for (const perk of tier.perks) {
                                            if ((tierNumber === 7 || tierNumber === 10) && (perk.name !== 'Host your own Megacollab' || perk.name !== 'Custom Endless Mirage Hoodie')) { // Peak tiers have all the perks permanent to them
                                                newPerks.push(perk);
                                                console.log(`Perk ${perk.name} has been pushed.`);
                                            } else if (!perk.singleUse) {
                                                newPerks.push(perk);
                                                console.log(`Perk ${perk.name} has been pushed.`);
                                            }
                                        }
                                        if (tier.name === roleToFind) {
                                            await localFunctions.setPerks(userId, newPerks, collection);
                                            console.log('Perks uploaded.');
                                            userPerks = newPerks;
                                            break;
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    } else if (userTier) {
                        tierString = `**Current Tier: ${userTier.name}**`;
                        tierDetails = localConstants.premiumTiers.find(tier => tier.name === userTier.name);
                    }

                    if (tierDetails.generalRenewalPrice) {
                        tierString = `${tierString}\n*Renewal price for all perks: ${tierDetails.generalRenewalPrice}$*`;
                    }

                    if (userPerks?.length) {
                        let useMenu = new SelectMenuBuilder()
                            .setCustomId('use-perks')
                            .setPlaceholder('Use your perks.');

                        premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });

                        if (userPerks.some(perk => perk.singleUse === false)) {
                            premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n🔮 Permanent perks\`\`\`**`);
                            tierString = ' ';
                            for (const perk of userPerks) {
                                if ((!perk.singleUse || userTier.name === 'Mirage VII' || userTier.name === 'Mirage X') && perk.name !== 'Host your own Megacollab' && perk.name !== 'Custom Endless Mirage Hoodie') {
                                    if (perk.singleUse) {
                                        useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                                    }
                                    premiumEmbed.addFields({
                                        name: ' ',
                                        value: `\`\`✒️ ${perk.name}\`\`\n └ ${perk.description}`
                                    });
                                }
                            }
                        }
                        if (userPerks.some(perk => perk.singleUse === true)) {
                            if (tierString !== ' ') {
                                premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n✅ Perks available to use!\`\`\`**`);
                            } else {
                                premiumEmbed.addFields(
                                    {
                                        name: ' ',
                                        value: '**```ml\n✅ Perks available to use!```**'
                                    }
                                );
                            }
                            for (const perk of userPerks) {
                                if (perk.singleUse && userTier.name !== 'Mirage VII' && userTier.name !== 'Mirage X') {
                                    if (perk.renewalPrice) {
                                        renewalPrice = `\n └ Your current renewal price is ${perk.renewalPrice}$.`;
                                    } else {
                                        renewalPrice = '';
                                    }
                                    premiumEmbed.addFields({
                                        name: ' ',
                                        value: `\`\`🎫 ${perk.name}\`\`\n ├ ${perk.description}${renewalPrice}`
                                    });
                                    useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                                } else if (perk.name === 'Custom Endless Mirage Hoodie' || perk.name === 'Host your own Megacollab') {
                                    premiumEmbed.addFields({
                                        name: ' ',
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
                                .setStyle('Primary')
                        );

                        if (userTier.name !== 'Mirage VII' || userTier.name !== 'Mirage X') {
                            mainComponents.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('upgrade-tier')
                                    .setLabel('⏏️ Upgrade')
                                    .setStyle('Primary'),
                                new ButtonBuilder()
                                    .setCustomId('premium-renew')
                                    .setLabel('🔁 Renew')
                                    .setStyle('Primary')
                            );
                        }

                        try {
                            if (useMenu.options[0].data) {
                                const useComponents = new ActionRowBuilder().addComponents(useMenu);
                                premiumEmbed.addFields(
                                    {
                                        name: '‎',
                                        value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                                    }
                                );
                                await int.editReply({
                                    content: '',
                                    embeds: [premiumEmbed],
                                    components: [useComponents, mainComponents]
                                });
                            }
                        } catch (error) {
                            premiumEmbed.addFields(
                                {
                                    name: '‎',
                                    value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                                }
                            );
                            await int.editReply({
                                content: '',
                                embeds: [premiumEmbed],
                                components: [mainComponents]
                            });
                        }

                    } else {
                        decayString = `\n └ Your tier will decay <t:${premiumData.date}:R>.`;

                        premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                        premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n⚠️ No perks available to claim!\`\`\`**`);
                        premiumEmbed.addFields({ name: ' ', value: `\`\`🎫 Notice\`\`\n ├ It's recommended to renew any of your perks.${decayString}` });
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
                                .setStyle('Primary')
                        );
                        premiumEmbed.addFields(
                            {
                                name: '‎',
                                value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                            }
                        );
                        await int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [mainComponents]
                        });
                    }
                }
                return;
            }

            if (subcommand === 'set-decay') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const decayDate = int.options.getInteger('decaydate');

                try {
                    await localFunctions.setPerkStartingDecayDate(decayDate, collectionSpecial);
                    await int.editReply('New decay date set.');
                } catch {
                    await int.editReply('Something went wrong.');
                }
                return;
            }

            if (subcommand === 'set-prestige') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                await int.editReply('Resetting prestige. This might take a while...');

                const members = await int.guild.members.fetch();
                members.forEach(async member => {
                    for (const role of localConstants.rolesToRemove) {
                        if (member.roles.cache.has(role)) {
                            await member.roles.remove(role);
                            break;
                        }
                    }
                });

                const channel_update = await client.channels.cache.get('785727123808583721');
                const channel_warn = await client.channels.cache.get('874227481442398208');

                let users = [

                ];

                int.editReply('Starting to set new prestige. This might take a while...');

                for (const user of users) {
                    const memberId = user;
                    const member = await int.guild.members.fetch(memberId);

                    if (!member) {
                        console.log(`${memberId} is not in the server`);
                        channel_warn.send({ content: `User with ID ${memberId} is no longer in the server. Prestige has been set to 0.` });
                        continue;
                    }

                    let prestigeLevel = 0;
                    let prestige = member.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                    if (typeof prestige !== 'undefined') {
                        prestige = prestige.name;
                        prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                    } else {
                        prestigeLevel = 0;
                    }

                    if (!member.roles.cache.has('963295216910077962')) {
                        await member.roles.add('963295216910077962');
                    }

                    let oldPrestigeRole = localFunctions.getRoleIDByPrestige(prestigeLevel.toString());
                    let newPrestige = prestigeLevel + 1;
                    let newPrestigeRole = localFunctions.getRoleIDByPrestige(newPrestige.toString());
                    if (oldPrestigeRole) {
                        await member.roles.remove(oldPrestigeRole);
                    }
                    await member.roles.add(newPrestigeRole);
                    channel_update.send({ content: `<@${memberId}> Your collab prestige level is now **${newPrestige}**.` });
                }

                int.editReply('Done!');
                return;
            }

            if (subcommand === 'link') {
                if (int.user.id !== '687004886922952755') return int.editReply('You cannot do this.');
                const user = await v2.user.details(int.options.getString('osuid'), int.options.getString('gamemode'));

                if (typeof user === 'undefined') {
                    await int.editReply('User not found...');
                    return;
                }

                const userFiltered = localFunctions.removeFields(user, localConstants.unnecesaryFieldsOsu);
                userFiltered.osu_id = userFiltered.id;
                delete userFiltered.id;
                const userTop100 = await v2.scores.user.category(user.id, 'best', { mode: int.options.getString('gamemode'), limit: '100' });
                await int.editReply('Performing Skill Calculations and getting data analytics... This might take a minute or two.');
                const skills = await localFunctions.calculateSkill(userTop100, int.options.getString('gamemode'));
                let modsData = await localFunctions.analyzeMods(userTop100);

                const filler = {
                    mod: '--',
                    percentage: '--'
                };

                let i = 0;
                while (i < 4) {
                    if (typeof modsData.top4Mods[i] === 'undefined') {
                        modsData.top4Mods.push(filler);
                    }
                    i++;
                }

                userFiltered.skillRanks = skills;
                userFiltered.modsData = modsData;
                await localFunctions.verifyUserManual(int.options.getString('discordid'), userFiltered, collection);
                await int.editReply(`<@${int.user.id}> User linked succesfully.`);

                return;
            }

            if (subcommand === 'blacklist') {
                const user = int.options.getString('user');
                const osuId = int.options.getString('osuid');
                const reason = int.options.getString('reason');

                await localFunctions.setBlacklist(user, reason, osuId, blacklistCollection);

                let userCollabs = await localFunctions.getUserCollabs(user, collection);
                if (typeof userCollabs === 'undefined' || userCollabs.length === 0) return int.editReply('User added to the blacklist.');

                for (let userCollab of userCollabs) {
                    let collab = await localFunctions.getCollab(userCollab.collabName, collabCollection);
                    let contentString = '';
                    const snipes = collab.snipes;
                    if (typeof snipes !== 'undefined') {
                        if (typeof snipes.find(p => p.pick === id) !== 'undefined') {
                            contentString = 'Snipers! ';
                        }
                        for (const snipe of snipes) {
                            contentString = contentString.concat('', `<@${snipe.userId}>`);
                            await localFunctions.removeCollabSnipe(collab.name, collection, snipe.userId);
                        }
                    }
                    if (collab.status !== 'closed' && collab.status !== 'delivered' && collab.status !== 'archived' && collab.status !== 'completed') {
                        userCollabs = userCollabs.filter(e => e.collabName !== collab.name);
                        await localFunctions.setUserCollabs(userId, userCollabs, collection);
                        await localFunctions.unsetCollabParticipation(collab.name, collabCollection, userCollab.collabPick.id);
                        await localFunctions.removeCollabParticipant(collab.name, collabCollection, userId);
                        await localFunctions.unsetParticipationOnSheet(collab, userCollab.collabPick);
                        await localFunctions.liquidateUserOsuData(userId, collection);
                        const leaveEmbed = new EmbedBuilder()
                            .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                            .setColor('#f26e6a')
                            .setDescription(`**\`\`\`ml\n🎫 New Character Available!\`\`\`**                                                                                                        **${collab.name}**\nName:${userCollab.collabPick.name}\nID: ${userCollab.collabPick.id}`)
                            .setImage(userCollab.collabPick.imgURL);
                        logChannel.send({ content: `${contentString}\nUser <@${userId}> has been banned.`, embeds: [leaveEmbed] });
                    }
                    console.log(`Participation removed from ${userCollab.collabName}`);
                }

                return int.editReply('User added to the blacklist.');
            }
        }
    },
    monthlySupporterCache,
    adminCache,
    givePerksCache,
    giveTierCache
};
