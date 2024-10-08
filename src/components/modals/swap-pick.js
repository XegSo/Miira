const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { profileButtonCache } = require('../buttons/profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');

module.exports = {
    data: {
        name: 'swap-pick'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const collection = client.db.collection('Collabs');
        const userCollection = client.db.collection('Users');
        const collectionSpecial = client.db.collection('Special');
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        let initializedMap;
        if (profileMenuCache.size > 0) {
            if (typeof profileMenuCache.get(int.user.id) !== 'undefined') {
                initializedMap = profileMenuCache;
            }
        }
        if (profileButtonCache.size > 0) {
            if (typeof profileButtonCache.get(int.user.id) !== 'undefined') {
                initializedMap = profileButtonCache;
            }
        }
        try {
            const existingTradeRequest = await localFunctions.getTradeRequest(int.user.id, collectionSpecial);
            if (existingTradeRequest.length !== 0) {
                return await int.editReply({ content: `You cannot swap your pick when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }
            const collab = initializedMap.get(int.user.id).collab;
            if (collab.type === 'pooled') {
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
                let digits = pool[0].id.length;
                const pick = localFunctions.padNumberWithZeros(parseInt(int.fields.getTextInputValue('pick')), digits);
                const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                const userCollab = userCollabs.find(e => e.collabName === collab.name);
                const currentPick = pool.find((e) => e.id === userCollab.collabPick.id);
                const newPickFull = pool.find((e) => e.id === pick);
                if (typeof newPickFull === 'undefined') {
                    return int.editReply('Invalid character ID!');
                }
                if (newPickFull.status === 'picked') {
                    return int.editReply('This character has already been picked!');
                }
                const userOsuDataFull = await localFunctions.getOsuData(userId, userCollection);
                await localFunctions.unsetCollabParticipation(collab.name, collection, currentPick.id);
                await localFunctions.setCollabParticipation(collab.name, collection, pick);
                await localFunctions.editCollabParticipantPickOnCollab(collab.name, userId, newPickFull, collection);
                await localFunctions.editCollabParticipantPickOnUser(userId, collab.name, newPickFull, userCollection);

                let contentString = '';
                const snipes = await localFunctions.getCollabSnipes(collab.name, collection, currentPick.id);
                if (typeof snipes !== 'undefined') {
                    if (typeof snipes.find(p => p.pick === currentPick.id) !== 'undefined') {
                        contentString = 'Snipers! ';
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
                            name: '‎',
                            value: '**```ml\n- Picked```**',
                            inline: true
                        },
                        {
                            name: '‎',
                            value: `┌ Pick ID: **${newPickFull.id}**\n└ Name: **${newPickFull.name}**`,
                            inline: true
                        },
                        {
                            name: '‎',
                            value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                        },
                        {
                            name: '‎',
                            value: '**```js\n+ Available```**',
                            inline: true
                        },
                        {
                            name: '‎',
                            value: `┌ Pick ID: **${currentPick.id}**\n└ Name: **${currentPick.name}**`,
                            inline: true
                        },
                        {
                            name: '‎',
                            value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                        }
                    );
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
        } catch (e) {
            console.log(e);
        }
    }
};
