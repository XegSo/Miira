const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Suggest something for the server or collabs.'),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const suggestionChannel = int.guild.channels.cache.get(localConstants.suggestionChannelID);
        const suggestion = int.options.getString('suggestion');
    
        if (!suggestion) {
          int.editReply({ content: 'Please provide a suggestion.', ephemeral: true });
          return;
        }
    
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
          .setDescription(suggestion)
          .addFields(
            { name: '\u200B', value: `**Status: ${status}**\n**Click on 🔺 to upvote.**\nTotal upvotes: 0\n\nClick on 🔻 to downvote.\nTotal downvotes: 0\n\n*Only admins can click on ✔️ or ❌.*\n` },
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
                .setLabel('✔️')
                .setStyle('Secondary'),
              new ButtonBuilder()
                .setCustomId('suggestion-deny')
                .setLabel('❌')
                .setStyle('Secondary'),
              new ButtonBuilder()
                .setCustomId('suggestion-thread')
                .setLabel('📁 Create Thread')
                .setStyle('Secondary')    
            ),
          ],
          ephemeral: true,
        });

        let voters = [];
        voters.push(int.user.id);

        await localFunctions.updateSuggestion(message.id, int.user.id, status, suggestionEmbed, 0, 0, voters);
    
        //send suggestion to db
    
        int.editReply({ content: `Your suggestion has been sucesfully uploaded.`, ephemeral: true });
    }    
}