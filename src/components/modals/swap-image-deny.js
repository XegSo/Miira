const { ImageRequestCache } = require('../buttons/swap-image-deny.js');
const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'swap-image-deny'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(int.user.id);
        if (!guildMember.roles.cache.has(localConstants.collabAdminsRoleID)) return int.editReply('You have no permission to do this!');
        const request = ImageRequestCache.get(int.user.id).request;
        const message = ImageRequestCache.get(int.user.id).message;
        if (typeof request === 'undefined') return int.editReply('Something went wrong...');
        const reason = int.fields.getTextInputValue('reason');
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        let imageSwapEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | Rejected Request', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp()
            .setImage(request.imgURL)
            .setURL('https://endlessmirage.net/')
            .setDescription('**```🏐 Rejected image request...```**')
            .addFields(
                {
                    name: request.embed.data.fields[0].name,
                    value: request.embed.data.fields[0].value
                },
                {
                    name: request.embed.data.fields[1].name,
                    value: request.embed.data.fields[1].value
                }
            );

        let oldImageEmbed = new EmbedBuilder()
            .setURL('https://endlessmirage.net/')
            .setImage(request.oldImgURL);
        await message.edit({ embeds: [imageSwapEmbed, oldImageEmbed], components: [] });
        await logChannel.send({ content: `<@${request.user}> Your image change request has been denied.\n**Reason:** ${reason}`, embeds: [imageSwapEmbed, oldImageEmbed] });
        await localFunctions.liquidateImageRequest(client, request._id);
        ImageRequestCache.delete(int.user.id);
        await int.editReply({ content: 'Request successfully denied.', ephemeral: true });
    }
};
