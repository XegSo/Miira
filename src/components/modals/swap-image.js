const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { profileButtonCache } = require('../buttons/profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');

module.exports = {
    data: {
        name: 'swap-image'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
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
        const guild = client.guilds.cache.get(localConstants.guildId);
        const requestChannel = guild.channels.cache.get(localConstants.imageSwapChannelID);
        let type = 'image change';
        const imageURL = int.fields.getTextInputValue('imageURL');
        const isPNG = await localFunctions.isPNGURL(imageURL);
        if (!isPNG) return int.editReply('The provided image URL is not valid or is not png! Please provide a valid png URL.');
        let alreadySuggested = await localFunctions.getImageRequestByUser(client, int.user.id);
        if (alreadySuggested) return int.editReply('You already have a request under review!');
        let status = 'Pending';
        let collab = initializedMap.get(int.user.id).collab;
        if (collab.status === 'closed' || collab.status === 'delivered' || collab.status === 'early delivery' || collab.status === 'completed' || collab.status === 'archived') return int.editReply('You cannot submit a request at this collab status...');
        let pick = await collab.participants.find(p => p.discordId === int.user.id.toString());
        let imageSwapEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | Image Request', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setImage(imageURL)
            .setTimestamp()
            .setURL('https://endlessmirage.net/')
            .setDescription('**```🏐 New image swap request!```**')
            .addFields(
                {
                    name: '‎',
                    value: `┌ **User**: <@${int.user.id}>\n└ **Collab**: ${collab.name}\n\n┌ **Pick Name**: ${pick.name}\n└ **Pick Series**: ${pick.series}`
                },
                {
                    name: '‎',
                    value: '-New Image is on **Left**\n-Current Image is on **Right**'
                }
            );

        let oldImageEmbed = new EmbedBuilder()
            .setImage(pick.imgURL)
            .setURL('https://endlessmirage.net/');

        const message = await requestChannel.send({
            embeds: [imageSwapEmbed, oldImageEmbed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('swap-image-approve')
                        .setLabel('Approve')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('swap-image-deny')
                        .setLabel('Deny')
                        .setStyle('Danger')
                )
            ],
            ephemeral: true
        });

        await localFunctions.updateImageRequest(client, message.id, type, int.user.id, imageURL, pick.imgURL, status, imageSwapEmbed, collab.name, pick.id);
        await int.editReply({ content: 'Your request has been sent successfully', ephemeral: true });
    }
};
