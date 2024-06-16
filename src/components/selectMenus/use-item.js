const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'use-item'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const guild = int.guild;
        const guildMember = await guild.members.cache.get(userId);
        const selectedItem = int.values[0];
        const collection = client.db.collection('OzenCollection');
        const userInventory = await localFunctions.getInventory(userId, collection);

        if (selectedItem && userInventory.some((item) => item.name === selectedItem)) {
            const itemIndex = userInventory.findIndex((item) => item.name === selectedItem);
            const itemObject = userInventory.find((item) => item.name === selectedItem);
            // Check if the selected item is the "Tokens Boost X2 72h" item
            if (selectedItem === 'Tokens Boost X2 72h') {
                // Check if the user already has an active boost
                const boostEndTime = await localFunctions.getBoostEndTime(userId, collection);

                if (!boostEndTime || Date.now() > boostEndTime) {
                    // User doesn't have an active boost or the boost has expired
                    const boostDuration = 72 * 60 * 60 * 1000; // 72 hours in milliseconds
                    const newBoostEndTime = Date.now() + boostDuration;

                    // Set the boost end time in the database
                    await localFunctions.setBoostEndTime(userId, newBoostEndTime, collection);

                    await int.editReply(`<@${userId}> has activated a 2X Tokens Earned Boost for 72 hours!`);
                } else {
                    await int.editReply({ content: 'You already have an active Tokens Earned Boost.', ephemeral: true });
                }
            } else if (selectedItem === 'Permanent X2 Boost') {
                const PermaBoost = await localFunctions.getPermaBoost(userId, collection);

                if (!PermaBoost) {
                    await localFunctions.setPermaBoost(userId, true, collection);
                    await int.editReply(`<@${userId}> has activated a Permanent 2X Tokens Earned Boost!`);
                } else {
                    await int.editReply({ content: 'You already have an active Permanent Tokens Earned Boost.', ephemeral: true });
                }
            } else if (selectedItem === 'Novice Active Member Role') {
                if (int.member.roles.cache.has('1150870507445563452')) {
                    await int.editReply({ content: 'You already have the role!', ephemeral: true });
                    return;
                }

                await int.member.roles.add('1150870507445563452');

                if (!int.member.roles.cache.has('1150870875650928771')) {
                    await int.member.roles.add('1150870875650928771');
                }

                await int.editReply({ content: 'You have obtained the Novice Active Member Role!', ephemeral: true });


            } else if (localConstants.channelCreationActions.includes(selectedItem)) {
                const logChannel = int.guild.channels.cache.get('1150889016791683172');
                const commissionsCategoryId = '1150876397875761222';
                const commissionsCategory = guild.channels.cache.get(commissionsCategoryId);
                guild.channels.create({
                    name: `📌・commission-${int.user.tag}`,
                    type: ChannelType.GuildText,
                    parent: commissionsCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone, // @everyone role
                            deny: [PermissionsBitField.Flags.ViewChannel] // Deny view permissions by default
                        },
                        {
                            id: userId, // User who requested the channel
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]// Allow view and send messages
                        }
                    ]
                })
                    .then(async (channel) => {
                        await int.editReply({ content: `Commission channel created: ${channel}`, ephemeral: true });
                        const comEmbed = new EmbedBuilder()
                            .setColor('#f26e6a')
                            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                            .setThumbnail(int.user.displayAvatarURL())
                            .setTitle(`New commission for user ${int.user.tag}.`)
                            .setDescription(`**Type: ${selectedItem}**`);
                        await channel.send({
                            content: `<@${userId}> <@687004886922952755>`,
                            embeds: [comEmbed],
                            ephemeral: true
                        });
                        const commissionLogEmbed = new EmbedBuilder()
                            .setColor('#f26e6a')
                            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                            .setAuthor({ name: '✒️ A new commission has been requested.', iconURL: int.user.displayAvatarURL() })
                            .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
                            .setDescription(`**Type: ${selectedItem}**\nOpened by <@${int.user.id}>\nDate: <t:${Math.floor(new Date(Date.now()) / 1000)}:F>.`);
                        logChannel.send({ content: '', embeds: [commissionLogEmbed] });
                    })
                    .catch((error) => {
                        console.error('Error creating the commission channel:', error);
                        int.editReply({ content: 'An error occurred while creating the commission channel.', ephemeral: true });
                    });

            } else if (selectedItem === 'Advanced Active Member Role') {
                if (int.member.roles.cache.has('1150870529104949330')) {
                    await int.editReply({ content: 'You already have the role!', ephemeral: true });
                    return;
                }

                await int.member.roles.add('1150870529104949330');

                if (!int.member.roles.cache.has('1150870875650928771')) {
                    await int.member.roles.add('1150870875650928771');
                }

                await int.editReply({ content: 'You have obtained the Advanced Active Member Role!', ephemeral: true });


            } else if (selectedItem === 'Ultimate Active Member Role') {
                if (int.member.roles.cache.has('1150870546842660904')) {
                    await int.editReply({ content: 'You already have the role!', ephemeral: true });
                    return;
                }

                await int.member.roles.add('1150870546842660904');

                if (!int.member.roles.cache.has('1150870875650928771')) {
                    await int.member.roles.add('1150870875650928771');
                }

                await int.editReply({ content: 'You have obtained the **Ultimate** Active Member Role!', ephemeral: true });

            } else if (selectedItem === 'Premium Avatar') {
                let perk = localConstants.premiumTiers[0].perks[0];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (typeof userPerks.find(e => e.name === perk.name) === 'undefined') {
                    userPerks.push(perk);
                    await localFunctions.setPerks(userId, userPerks, collection);
                } else {
                    await int.editReply({ content: 'You already have this perk!', ephemeral: true });
                    return;
                }
                await int.editReply({ content: 'You have obtained the Premium Avatar Perk! Check /collabs premium', ephemeral: true });

            } else if (selectedItem === 'Premium Cover') {
                let perk = localConstants.premiumTiers[0].perks[1];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (typeof userPerks.find(e => e.name === perk.name) === 'undefined') {
                    userPerks.push(perk);
                    await localFunctions.setPerks(userId, userPerks, collection);
                } else {
                    await int.editReply({ content: 'You already have this perk!', ephemeral: true });
                    return;
                }
                await int.editReply({ content: 'You have obtained the Premium Cover Perk! Check /collabs premium', ephemeral: true });

            } else if (selectedItem === 'Premium Signature') {
                let perk = localConstants.premiumTiers[1].perks[1];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (typeof userPerks.find(e => e.name === perk.name) === 'undefined') {
                    userPerks.push(perk);
                    await localFunctions.setPerks(userId, userPerks, collection);
                } else {
                    await int.editReply({ content: 'You already have this perk!', ephemeral: true });
                    return;
                }
                await int.editReply({ content: 'You have obtained the Premium Signature Perk! Check /collabs premium', ephemeral: true });

            } else if (selectedItem === 'Premium Desktop Wallpaper') {
                let perk = localConstants.premiumTiers[2].perks[1];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (typeof userPerks.find(e => e.name === perk.name) === 'undefined') {
                    userPerks.push(perk);
                    await localFunctions.setPerks(userId, userPerks, collection);
                } else {
                    await int.editReply({ content: 'You already have this perk!', ephemeral: true });
                    return;
                }
                await int.editReply({ content: 'You have obtained the Premium Signature Perk! Check /collabs premium', ephemeral: true });

            } else if (selectedItem === 'Extra Collab Materials') {
                let perk = localConstants.premiumTiers[4].perks[1];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (typeof userPerks.find(e => e.name === perk.name) === 'undefined') {
                    userPerks.push(perk);
                    await localFunctions.setPerks(userId, userPerks, collection);
                } else {
                    await int.editReply({ content: 'You already have this perk!', ephemeral: true });
                    return;
                }
                await int.editReply({ content: 'You have obtained the Premium Signature Perk! Check /collabs premium', ephemeral: true });

            } else if (selectedItem === 'Endless Mirage Skin') {
                let perk = localConstants.premiumTiers[4].perks[0];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (typeof userPerks.find(e => e.name === perk.name) === 'undefined') {
                    userPerks.push(perk);
                    await localFunctions.setPerks(userId, userPerks, collection);
                } else {
                    await int.editReply({ content: 'You already have this perk!', ephemeral: true });
                    return;
                }
                await int.editReply({ content: 'You have obtained the Endless Mirage Skin Perk! Check /collabs premium', ephemeral: true });

            } else if (selectedItem === 'Collab Early Access') {
                let perk = localConstants.premiumTiers[6].perks[0];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (typeof userPerks.find(e => e.name === perk.name) === 'undefined') {
                    userPerks.push(perk);
                    await localFunctions.setPerks(userId, userPerks, collection);
                } else {
                    await int.editReply({ content: 'You already have this perk!', ephemeral: true });
                    return;
                }
                await int.editReply({ content: 'You have obtained the Collab Early Access Perk! Check /collabs premium', ephemeral: true });

            } else if (selectedItem === 'Global Boost') {
                const announcementsChannel = int.guild.channels.cache.get('764561474000912434');
                localFunctions.applyGlobalBoost(4, 24, client);
                await int.editReply({ content: 'Global boost applied!', ephemeral: true });
                announcementsChannel.send(`<@&1107112464455311400> <@${int.user.id}> has activated a global 4X Token Boost for 24 hours!`);

            } else if (itemObject.isReturnable) {
                let onUseItems = await localFunctions.getOnUse(userId, collection);
                let backgroundOnUse = onUseItems.find((item) => item.type === 'background');
                if (backgroundOnUse) {
                    if (backgroundOnUse.name === selectedItem) {
                        await int.editReply({ content: 'You\'re already using this cosmetic!', ephemeral: true });
                        return;
                    }
                    onUseItems = onUseItems.filter((item) => item.type !== 'background');
                    userInventory.push(backgroundOnUse);
                }
                onUseItems.push(itemObject);
                await localFunctions.setOnUse(userId, onUseItems, collection);
                await int.editReply({ content: 'Cosmetic succesfully enabled!', ephemeral: true });
            } else if (selectedItem === 'Prestige Boost') {
                let prestigeLevel = 0;
                let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                if (typeof prestige !== 'undefined') {
                    prestige = prestige.name;
                    prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                }
                if (prestigeLevel === '9') {
                    return int.editReply({ content: 'You already are at the peak prestige level!', ephemeral: true });
                }

                const channel_update = await client.channels.cache.get('785727123808583721');
                if (!guildMember.roles.cache.has('963295216910077962')) {
                    await guildMember.roles.add('963295216910077962');
                }

                let oldPrestigeRole = localFunctions.getRoleIDByPrestige(prestigeLevel.toString());
                let newPrestige = prestigeLevel + 1;
                let newPrestigeRole = localFunctions.getRoleIDByPrestige(newPrestige.toString());
                if (oldPrestigeRole) {
                    await guildMember.roles.remove(oldPrestigeRole);
                }
                await guildMember.roles.add(newPrestigeRole);
                channel_update.send({ content: `<@${userId}> Your collab prestige level is now **${newPrestige}**.` });
                int.editReply({ content: `You have upgraded to Prestige **${newPrestige}**`, ephemeral: true });
            } else {
                await int.editReply({ content: 'Something went wrong...', ephemeral: true });
                return;
            }

            if (itemIndex !== -1) {
                // Remove the item from the user's inventory
                userInventory.splice(itemIndex, 1);

                // Save the updated inventory back to the database
                await localFunctions.setInventory(userId, userInventory, collection);
            }
        } else {
            await int.editReply({ content: `You've already used ${selectedItem}!`, ephemeral: true });
        }
    }
};
