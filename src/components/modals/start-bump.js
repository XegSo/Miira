const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');


module.exports = {
  data: {
    name: "start-bump"
  },
  async execute(int, client) {
    await int.deferReply({ ephemeral: true });
    const guild = client.guilds.cache.get(localConstants.guildId);
    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
    const currentDate = Math.floor(Date.now() / 1000);
    const duration = parseInt(int.fields.getTextInputValue('duration'));
    if (isNaN(duration)) return int.editReply('Provide a valid number of days.');
    try {
      const allCollabs = await localFunctions.getCollabs(collection);
      const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status === "open" || c.status === "early access" || c.status === "on design"));
      if (typeof openMegacollab === "undefined") {
        await int.editReply('There is no open megacollabs at the moment...')
      } else {
        const collab = openMegacollab;
        const logChannel = guild.channels.cache.get(collab.logChannel);
        if (typeof collab.bumps !== "undefined") {
          if (collab.bumps.length === 4) return int.editReply('You cannot open a new bump as there have been already 4 bumps...');
          const currentBumpIndex = collab.bumps.length - 1;
          if (currentDate - collab.bumps[currentBumpIndex].startingDate < collab.bumps[currentBumpIndex].days * 24 * 60 * 60) return int.editReply(`There is a bump already open.`);
        }
        const newBump = {
          startingDate: currentDate,
          days: duration,
          users: []
        }
        await localFunctions.addCollabBump(collab.name, collection, newBump);
        const dashboardEmbed = new EmbedBuilder()
          .setFooter({ text: 'Endless Mirage | Bumps Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
          .setColor('#f26e6a')
          .setDescription(`**\`\`\`ml\n🥊 A new bump has started!\`\`\`**\n*Bump #${collab.bumps ? collab.bumps.length : "1"} of the ${collab.name}*\n\n**Press the button bellow or use the command \`\`/collabs quick bump\`\` to bump your participation!**\n**You have ${duration} days to bump.**\n\nThere will be a total of 4 bumps, and missing 2 of them will lead to a removal of your entry!`);
          
        const components = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('collab-bump')
                .setLabel('🥊 Bump')
                .setStyle('Success'),
        );

        await logChannel.send({content: `<@&${collab.roleId}>`, embeds: [dashboardEmbed], components: [components]})

        int.editReply('A new bump has started!');

      }
    } catch (e) {
      console.log(e);
    } finally {
      mongoClient.close();
    }
  },
};