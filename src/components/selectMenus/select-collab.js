const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, getUserAgentAppendix } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
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
    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
    const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
    const guild = client.guilds.cache.get(localConstants.guildId);
    const guildMember = guild.members.cache.get(userId);
    try {
      const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
      const userOsuData = await localFunctions.getOsuData(userId, userCollection);
      let collab = await localFunctions.getCollab(int.values[0], collection);
      let components = [];
      let URLstring = '';
      if (typeof collab.spreadsheetID !== "undefined") {
        URLstring = `  [Spreadsheet URL](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})\n`
      }
      const dashboardEmbed = new EmbedBuilder()
        .setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
        .setColor('#f26e6a')
        .setDescription(`**\`\`\`\n🏐 ${collab.name}\`\`\`**\n${URLstring}`);

      let extraString = '';

      if (collab.user_cap !== 0) {
        extraString = ` User Limit: ${collab.user_cap}\n`
      } else {
        extraString = ` Unlimited\n`
      }

      dashboardEmbed.addFields(
        {
          name: `‎`,
          value: `• Type: ${localFunctions.capitalizeFirstLetter(collab.type)}\n Topic: ${localFunctions.capitalizeFirstLetter(collab.topic)}\n Status: ${localFunctions.capitalizeFirstLetter(collab.status)}\n`,
          inline: true
        }
      );

      dashboardEmbed.addFields(
        {
          name: `‎`,
          value: `• Class: ${localFunctions.capitalizeFirstLetter(collab.restriction)}\n Opening date: <t:${parseInt(collab.opening)}:R>\n${extraString}`,
          inline: true
        }
      );

      dashboardEmbed.addFields(
        {
          name: `‎`,
          value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
        }
      )
      components = new ActionRowBuilder();

      const userData = await localFunctions.getOsuData(userId, userCollection);
      if (userData) {
        components.addComponents(
          new ButtonBuilder()
            .setCustomId('profile-collab')
            .setLabel('🎫 General Profile')
            .setStyle('Primary'),
        )
      } else {
        components.addComponents(
          new ButtonBuilder()
            .setCustomId('link-osu')
            .setLabel('🔗 Link your osu! Account')
            .setStyle('Success'),
        )
      }

      if (typeof userCollabs.find(e => e.collabName === collab.name) === "undefined" && collab.status !== "full") {
        switch (collab.status) {
          case 'open':
            components.addComponents(
              new ButtonBuilder()
                .setCustomId('join-collab')
                .setLabel('✅ Join')
                .setStyle('Success'),
            )
            break;
          case 'early access':
            const userPerks = localFunctions.getPerks(userId, userCollection);
            if (typeof userPerks.find(e => e.name === 'Megacollab Early Access') !== "undefined" && collab.restriction === 'megacollab') {
              components.addComponents(
                new ButtonBuilder()
                  .setCustomId('join-collab')
                  .setLabel('✅ Join')
                  .setStyle('Success'),
              )
            }
          default:
            if (int.user.id === '687004886922952755') {
              components.addComponents(
                new ButtonBuilder()
                  .setCustomId('join-collab')
                  .setLabel('✅ Join (Testing)')
                  .setStyle('Success'),
              )
            }
            break;
        }
      } else if (typeof userCollabs.find(e => e.collabName === collab.name) !== "undefined") {
        components.addComponents(
          new ButtonBuilder()
            .setCustomId('profile-pick')
            .setLabel('🛅 Collab Profile')
            .setStyle('Primary'),
        )
        switch (collab.status) {
          case 'delivered':
            components.addComponents(
              new ButtonBuilder()
                .setCustomId('download-collab')
                .setLabel('⬇️ Download')
                .setStyle('Primary'),
            )
            break;
          case 'completed':
            components.addComponents(
              new ButtonBuilder()
                .setCustomId('download-collab')
                .setLabel('⬇️ Download')
                .setStyle('Primary'),
            )
            break;
          case 'early delivery':
            const userTier = await localFunctions.getTier(userId, userCollection);
            let tier = 0;
            if (!userTier && guildMember.roles.cache.has('743505566617436301') && !guildMember.roles.cache.has('1150484454071091280')) {
              let premiumDetails = await localFunctions.assignPremium(int, userId, collection, guildMember);
              tier = localFunctions.premiumToInteger(premiumDetails[0].name);
            } else {
              tier = localFunctions.premiumToInteger(userTier.name);
            }
            if (tier >= 4) {
              components.addComponents(
                new ButtonBuilder()
                  .setCustomId('download-collab')
                  .setLabel('⬇️ Download')
                  .setStyle('Primary'),
              )
            }
            break;
        }
      }

      if (userId === '687004886922952755') {
        components.addComponents(
          new ButtonBuilder()
            .setCustomId('admin-collab')
            .setLabel('⚙️ Admin')
            .setStyle('Secondary'),
        )
      }

      if (typeof collab.designs !== "undefined") {
        //add embeds with designs
      }

      buttonCache.set(int.user.id, {
        collab: collab.name,
        osuData: userOsuData,
        userCollabData: userCollabs
      })

      int.editReply({
        content: '',
        embeds: [dashboardEmbed],
        components: [components],
      });
    } catch (e) {
      console.log(e)
      int.editReply('Something went wrong...')
    } finally {
      mongoClient.close();
      mongoClientUsers.close();
    }
  },
  buttonCache: buttonCache
};