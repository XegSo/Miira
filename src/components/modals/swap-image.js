const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { profileButtonCache } = require('../buttons/profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');

module.exports = {
  data: {
    name: "swap-image"
  },
  async execute(int, client) {
    await int.deferReply({ ephemeral: true });
    let initializedMap;
    if (profileMenuCache.size > 0) {
      if (typeof profileMenuCache.get(int.user.id).collab !== "undefined") {
        initializedMap = profileMenuCache;
      }
    }
    if (profileButtonCache.size > 0) {
      if (typeof profileButtonCache.get(int.user.id).collab !== "undefined") {
        initializedMap = profileButtonCache;
      }
    }
    const requestChannel = int.guild.channels.cache.get(localConstants.imageSwapChannelID);
    let type = 'image change'
    const imageURL = int.fields.getTextInputValue("imageURL");
    const isPNG = await localFunctions.isPNGURL(imageURL);
    if (!isPNG) return await int.editReply('The provided image URL is not valid or is not png! Please provide a valid png URL.');
    let alreadySuggested = await localFunctions.getImageRequestByUser(int.user.id);
    if (alreadySuggested) return await int.editReply('You already have a request under review!');
    let status = 'Pending';
    let collab = initializedMap.get(int.user.id).collab;
    let pick = await collab.participants.find(p => p.discordId === int.user.id.toString());
    let imageSwapEmbed = new EmbedBuilder()
      .setFooter({ text: "Endless Mirage | Image Request", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
      .setColor('#f26e6a')
      .setImage(imageURL)
      .setTimestamp()
      .setURL('https://endlessmirage.net/')
      .setDescription(`**\`\`\`🏐 New image swap request!\`\`\`**`)
      .addFields(
        {
          name: '‎',
          value: `┌ **User**: <@${int.user.id}>\n└ **Collab**: ${collab.name}\n\n┌ **Pick Name**: ${pick.name}\n└ **Pick Series**: ${pick.series}`
        },
        {
          name: "‎",
          value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
        },
      )

    let oldImageEmbed = new EmbedBuilder()
      .setImage(pick.imgURL)
      .setURL('https://endlessmirage.net/')

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
            .setStyle('Danger'),
        ),
      ],
      ephemeral: true,
    });

    await localFunctions.updateImageRequest(message.id, type, int.user.id, imageURL, pick.imgURL, status, imageSwapEmbed, collab.name, pick.id);
    await int.editReply({ content: 'Your request has been sent successfully', ephemeral: true });
  },
};