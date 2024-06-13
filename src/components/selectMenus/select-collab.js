const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const buttonCache = new Map();

module.exports = {
    data: {
        name: 'select-collab'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const collection = client.db.collection('Collabs');
        const userCollection = client.db.collection('OzenCollection');
        const blacklistCollection = client.db.collection('Blacklist');
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        try {
            const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            const userInBlacklist = await localFunctions.getBlacklist(userId, blacklistCollection);
            let userOsuData = await localFunctions.getOsuData(userId, userCollection);
            let collab = await localFunctions.getCollab(int.values[0], collection);
            let collabColor;
            if (typeof collab.color === 'undefined') {
                collabColor = await localFunctions.getMeanColor(collab.thumbnail);
                await localFunctions.setCollabColor(collab.name, collabColor, collection);
            } else {
                collabColor = collab.color;
            }
            const userInCollab = userCollabs.find(e => e.collabName === collab.name) ? true : false;
            let components = [];
            let embeds = [];
            let URLstring = '';
            await localFunctions.changeHueFromUrl(localConstants.mirageLogo, collabColor, `./assets/coloredLogos/logo-${collabColor}.png`);
            if (typeof collab.spreadsheetID !== 'undefined') {
                URLstring = `[Spreadsheet](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})`;
            }
            const dashboardEmbed = new EmbedBuilder()
                .setColor(collabColor)
                .setURL('https://endlessmirage.net/');

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

            components = new ActionRowBuilder();

            const userData = await localFunctions.getOsuData(userId, userCollection);
            if (userData) {
                components.addComponents(
                    new ButtonBuilder()
                        .setCustomId('profile-collab')
                        .setLabel('🎫 General Profile')
                        .setStyle('Primary')
                );
            } else {
                components.addComponents(
                    new ButtonBuilder()
                        .setCustomId('link-osu')
                        .setLabel('🔗 Link your osu! Account')
                        .setStyle('Success')
                );
            }

            let tier = 0;
            let prestigeLevel = 0;
            let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
            if (typeof prestige !== 'undefined') {
                prestige = prestige.name;

                prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
            }
            const userTier = await localFunctions.getUserTier(userId, userCollection);
            if (userTier) {
                tier = localFunctions.premiumToInteger(userTier.name);
            } else if (guildMember.roles.cache.has('743505566617436301')) {
                let premiumDetails = await localFunctions.assignPremium(userId, userCollection, guildMember);
                tier = localFunctions.premiumToInteger(premiumDetails[0].name);
            }

            let infoValue = '';

            const deluxeEntry = await localFunctions.getDeluxeEntry(userId, userCollection);

            if (!userInBlacklist) {
                if (userInCollab) {
                    const fullParticipation = userCollabs.find(e => e.collabName === collab.name);
                    if (collab.restriction === 'deluxe' && typeof deluxeEntry.extra !== 'undefined') {
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('deluxe-extra')
                                .setLabel('💎 Extra mats')
                                .setStyle('Primary')
                        );
                    }
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('profile-pick')
                            .setLabel('🛅 Collab Profile')
                            .setStyle('Primary')
                    );
                    switch (collab.status) {
                    case 'delivered':
                    case 'archived':
                    case 'completed':
                        components.addComponents(
                            new ButtonBuilder()
                                .setLabel('⬇️ Download')
                                .setURL(`${collab.bucket}${fullParticipation.collabPick.id}.zip`)
                                .setStyle('Link')
                        );
                        break;
                    case 'early delivery':
                        if (tier >= 4) {
                            components.addComponents(
                                new ButtonBuilder()
                                    .setLabel('⬇️ Download')
                                    .setURL(`${collab.bucket}${fullParticipation.collabPick.id}.zip`)
                                    .setStyle('Link')
                            );
                        }
                        break;
                    }
                } else {
                    let userPerks = await localFunctions.getPerks(userId, userCollection);
                    switch (collab.restriction) {
                    case 'staff':
                        switch (collab.status) {
                        case 'open':
                            if (guildMember.roles.cache.has('961891383365500938')) {
                                infoValue = '**As a Staff member, you can participate in this collab!**';
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab')
                                        .setLabel('✅ Join')
                                        .setStyle('Success')
                                );
                            } else {
                                infoValue = '**This collab is hosted for staff only!**';
                            }
                            break;
                        case 'full':
                            infoValue = '**This collab is full!**';
                            break;
                        default:
                            infoValue = '**This collab is hosted for staff only!**';
                            break;
                        }
                        break;
                    case 'deluxe':
                        switch (collab.status) {
                        case 'open':
                            if (deluxeEntry) {
                                infoValue = '**You have an entry ticket for a deluxe collab!**';
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab')
                                        .setLabel('✅ Join')
                                        .setStyle('Success')
                                );
                            } else {
                                infoValue = '**To participate in this collab, you have to pay an entry fee**';
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('deluxe-collab-entry')
                                        .setLabel('⚙️ Buy Entry')
                                        .setStyle('Success')
                                );
                            }
                            break;
                        case 'on design':
                            if (deluxeEntry) {
                                infoValue = '**You have an entry ticket for a deluxe collab!**';
                            } else {
                                infoValue = '**To participate in this collab, you have to pay an entry fee**';
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('deluxe-collab-entry')
                                        .setLabel('⚙️ Buy Entry')
                                        .setStyle('Success')
                                );
                            }
                            break;
                        case 'full':
                            infoValue = '**This collab is full!**';
                            break;
                        default:
                            infoValue = '**This is a paid entry collab! To participate, you can buy an entry when this collab is on design or open.';
                            break;
                        }
                        break;
                    case 'megacollab':
                        switch (collab.status) {
                        case 'open':
                            infoValue = '**Join for free to this massive osu! project!**';
                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('join-collab')
                                    .setLabel('✅ Join')
                                    .setStyle('Success')
                            );
                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('join-collab-random')
                                    .setLabel('✅ Join Random')
                                    .setStyle('Success')
                            );
                            break;
                        case 'early access':
                            infoValue = '**Peak premium users, peak prestige users and admins are now picking!**';
                            if (typeof userPerks.find(e => e.name === 'Megacollab Early Access') !== 'undefined' || prestigeLevel >= 8 || guildMember.roles.cache.has('630636502187114496')/* admin*/ || guildMember.roles.cache.has('834962043735638016')/* special donator*/ || guildMember.roles.cache.has('962251481669574666')/* contributor*/) {
                                infoValue = '**You have early access!**';
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab')
                                        .setLabel('✅ Join')
                                        .setStyle('Success')
                                );
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab-random')
                                        .setLabel('✅ Join Random')
                                        .setStyle('Success')
                                );
                            }
                            break;
                        case 'full':
                            infoValue = '**This collab is full! Wow!**';
                            break;
                        default:
                            infoValue = '**Massive collab hosted for free!** Endless Mirage have the history of hosting massive user collaborations since 2018 and we don\'t seem to be stopping anytime soon!';
                            if (int.user.id === '687004886922952755') {
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab')
                                        .setLabel('✅ Join')
                                        .setStyle('Success')
                                );
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab-random')
                                        .setLabel('✅ Join Random')
                                        .setStyle('Success')
                                );
                            }
                            break;
                        }
                        break;
                    case 'prestige':
                        switch (collab.status) {
                        case 'open':
                            if (prestigeLevel >= 4) {
                                infoValue = '**You\'re able to participate in this collab!**';
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab')
                                        .setLabel('✅ Join')
                                        .setStyle('Success')
                                );
                            } else {
                                infoValue = '**Collab only for prestige 4+ users!**';
                            }
                            break;
                        case 'full':
                            infoValue = '**This collab is full!**';
                            break;
                        default:
                            infoValue = '**Collab only for prestige 4+ users!**';
                            break;
                        }
                        break;
                    case 'experimental':
                        switch (collab.status) {
                        case 'open':
                            if (prestigeLevel >= 4 || tier >= 1) {
                                infoValue = '**You\'re able to participate in this collab!**';
                                components.addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('join-collab')
                                        .setLabel('✅ Join')
                                        .setStyle('Success')
                                );
                            } else {
                                infoValue = '**This collab is a experiment. Only prestige 4+ and premium can join!**';
                            }
                            break;
                        case 'full':
                            infoValue = '**This collab is full!**';
                            break;
                        default:
                            infoValue = '**This collab is a experiment. Only prestige 4+ and premium can join!**';
                            break;
                        }
                        break;
                    case 'none':
                        switch (collab.status) {
                        case 'open':
                            infoValue = '**You\'re able to participate in this collab!**';
                            components.addComponents(
                                new ButtonBuilder()
                                    .setCustomId('join-collab')
                                    .setLabel('✅ Join')
                                    .setStyle('Success')
                            );
                            break;
                        case 'full':
                            infoValue = '**This collab is full!**';
                            break;
                        default:
                            infoValue = '**There is no restrictions for this collab! How awewsome**';
                            break;
                        }
                        break;
                    }
                }
            } else {
                components.addComponents(
                    new ButtonBuilder()
                        .setCustomId('blacklist-appeal')
                        .setLabel('⚫️ Appeal your Blacklist')
                        .setStyle('Secondary')
                );
            }


            dashboardEmbed.setDescription(`**\`\`\`\n🏐 ${collab.name}\`\`\`**                                                                                                        Please check the __**${URLstring}**__ for character availability and participants.`);

            if (infoValue.length !== 0) {
                dashboardEmbed.addFields(
                    {
                        name: '‎',
                        value: `${infoValue}`
                    }
                );
            }


            if (userId === collab.host || guildMember.roles.cache.has('630636502187114496')) {
                components.addComponents(
                    new ButtonBuilder()
                        .setCustomId('admin-collab')
                        .setLabel('⚙️ Admin')
                        .setStyle('Secondary')
                );
            }

            dashboardEmbed.setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'attachment://footer.png' });
            embeds.push(dashboardEmbed);

            if (collab.designs.length !== 0) {
                for (const design of collab.designs) {
                    let embed = new EmbedBuilder()
                        .setURL('https://endlessmirage.net/')
                        .setImage(design);

                    embeds.push(embed);
                }
            }

            const fullCollab = await localFunctions.getCollab(collab.name, collection);
            buttonCache.set(int.user.id, {
                collab: collab.name,
                osuData: userOsuData,
                userCollabData: userCollabs,
                fullCollabData: fullCollab
            });

            const attachment = new AttachmentBuilder(collab.thumbnail, {
                name: 'thumbnail.png'
            });

            await int.editReply({
                content: '',
                files: [attachment,
                    {
                        attachment: `./assets/coloredLogos/logo-${collabColor}.png`,
                        name: 'footer.png'
                    }
                ],
                embeds,
                components: [components]
            });

        } catch (e) {
            console.log(e);
            await int.editReply('Something went wrong...');
        }
    },
    buttonCache
};
