const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: `suggest-modal`
    },
    async execute (int, client) {
        await int.deferReply({ ephemeral: true });
        const suggestionChannel = int.guild.channels.cache.get(localConstants.suggestionChannelID);

        const title = int.fields.getTextInputValue("suggestion-title");
        const suggestion = int.fields.getTextInputValue("suggestion");
        const reason = int.fields.getTextInputValue("suggestion-reason");
        let status = 'Pending.';
    
        let suggestionEmbed = new EmbedBuilder()
          .setThumbnail(int.user.displayAvatarURL())
          .setAuthor({
            name: `New suggestion by ${int.user.tag}`,
            iconURL: int.user.displayAvatarURL()
          })
          .setColor('#f26e6a')
          .setImage('https://puu.sh/JPffc/3c792e61c9.png')
          .setTimestamp()
          .setDescription(`**Title:** ${title}\n\n**Suggestion:** ${suggestion}\n\n**Why?** ${reason}`)
          .addFields(
            { name: '\u200B', value: `**Status: ${status}**\n\nClick on 🔺 to upvote.\nTotal upvotes: 0\n\nClick on 🔻 to downvote.\nTotal downvotes: 0\n\n*Only admins can click on ✅ or ❎.*\n` },
          );
    
        const message = await suggestionChannel.send({
          embeds: [suggestionEmbed],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('suggestion-upvote')
                .setLabel('🔺')
                .setStyle('Secondary'),
              new ButtonBuilder()
                .setCustomId('suggestion-downvote')
                .setLabel('🔻')
                .setStyle('Secondary'),
              new ButtonBuilder()
                .setCustomId('suggestion-approve')
                .setLabel('✅')
                .setStyle('Secondary'),
              new ButtonBuilder()
                .setCustomId('suggestion-deny')
                .setLabel('❎')
                .setStyle('Secondary'),
              new ButtonBuilder()
                .setCustomId('suggestion-thread')
                .setLabel('📁 Create Thread')
                .setStyle('Secondary')    
            ),
          ],
          ephemeral: true,
        });

        let voters = new Map();
        let upvoters = [];
        let downvoters = [];
        voters.set('upvoters', upvoters);
        voters.set('downvoters', downvoters);

        await localFunctions.updateSuggestion(message.id, int.user.id, status, suggestionEmbed, 0, 0, voters);
        await int.editReply({ content: 'Your suggestion has been sent successfully. \nNote: If you want to delete your own suggestion, click on the ❎ button.', ephemeral: true });
    },
};