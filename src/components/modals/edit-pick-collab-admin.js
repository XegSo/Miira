const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { userCheckCache } = require('../../commands/collabs/collabs');
const { userCheckCacheModal } = require('./check-pick');
const { connectToMongoDB } = require('../../mongo');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: "edit-pick-collab-admin"
  },
  async execute(int, client) {
    await int.deferReply({ ephemeral: true });
    let initializedMap;
    if (userCheckCache.size > 0) {
      if (typeof userCheckCache.get(int.user.id) !== "undefined") {
        initializedMap = userCheckCache;
      }
    }
    if (userCheckCacheModal.size > 0) {
      if (typeof userCheckCacheModal.get(int.user.id) !== "undefined") {
        initializedMap = userCheckCacheModal;
      }
    }
    const guild = client.guilds.cache.get(localConstants.guildId);
    const pick = initializedMap.get(int.user.id).pick;
    let user = null;
    let contentString = "";
    if (typeof initializedMap.get(int.user.id).participation !== "undefined") {
      user = initializedMap.get(int.user.id).participation.discordId;
      contentString = `<@${user}>`
    }
    const collab = initializedMap.get(int.user.id).collab.name;
    const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
    const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
    try {
      await localFunctions.editPickName(pick.id, user, collab, collabCollection, userCollection, int.fields.getTextInputValue("ch_name"));
      const logChannel = guild.channels.cache.get(localConstants.logChannelID);
      const auditChannel = guild.channels.cache.get(localConstants.auditLogChannelID);
      let charEmbed = new EmbedBuilder()
        .setFooter({ text: "Endless Mirage | Character Name Edit", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
        .setColor('#f26e6a')
        .setTimestamp()
        .setDescription(`**\`\`\`🏐 Admin character edit!\`\`\`**                                                                                                        \n**Old Name**: ${pick.name}\n**New name:** ${int.fields.getTextInputValue("ch_name")}`)
        .addFields(
          {
            name: "‎",
            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
          }
        )
      await logChannel.send({ content: `${contentString} Your pick has been edited.`, embeds: [charEmbed] });
      const auditEmbed = new EmbedBuilder()
        .setFooter({ text: 'Endless Mirage | Audit Log', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
        .setColor('#f26e6a')
        .setDescription(`**\`\`\`ml\n📣 New Action Taken\`\`\`**                                                                                                        **A pick's name has been changed**\n\n**Pick ID**: ${pick.id}\n**Old Name**: ${pick.name}\n**New Name**: ${int.fields.getTextInputValue("ch_name")}`);
      auditChannel.send({ content: '', embeds: [auditEmbed] });
      await int.editReply({ content: 'The name of the pick has been changed.', ephemeral: true });
    } finally {
      mongoClientCollabs.close();
      mongoClientUsers.close();
    }
  },
};