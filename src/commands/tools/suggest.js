const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
            { name: '\u200B', value: `**Status: ${status}**\nReact with 🔺 to upvote.\nReact with 🔻 to downvote.\n*Only admins can react with ✔️ for approval.*\n` },
          );
    
        const message = await suggestionChannel.send({ embeds: [suggestionEmbed] });
        await localFunctions.updateSuggestion(message.id, int.user.id, status, suggestionEmbed);
        message.react('🔺')
          .then(() => message.react('🔻'))
          .then(() => message.react('✔️'));
    
        //send suggestion to db
    
        int.editReply({ content: `Your suggestion has been sucesfully uploaded.`, ephemeral: true });
    }    
}