const { SuggestionCache } = require('../buttons/suggestion-deny');
const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: `suggestion-denial`
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const suggestionMessage = SuggestionCache.get(int.user.id).message;
        const suggestion = await localFunctions.getSuggestion(suggestionMessage.id);
        const reason = int.fields.getTextInputValue("text-reason");
        let status = 'Denied.';
        const updatedEmbed = new EmbedBuilder()
            .setThumbnail(suggestion.embed.data.thumbnail.url)
            .setAuthor({
                name: suggestion.embed.data.author.name,
                iconURL: suggestion.embed.data.author.icon_url
            })
            .setColor('#f26e6a')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setTimestamp()
            .setDescription(suggestion.embed.data.description)
            .addFields(
                { name: '\u200B', value: `**Status: ${status}**\n\n🔺 Total Upvote count: ${suggestion.upvotes}.\n🔻 Total Downvote count: ${suggestion.downvotes}.\n🔴 Denied by <@${int.user.id}>\nReason: ${reason}` },
            );
        suggestionMessage.edit({ embeds: [updatedEmbed], components: [] });
        suggestionMessage.reply(`<@${suggestion.user}> Your suggestion has been denied.\nReason: ${reason}`);
        await localFunctions.liquidateSuggestion(suggestionMessage.id);
        SuggestionCache.delete(int.user.id);
        await int.editReply({ content: 'Suggestion successfully denied.', ephemeral: true });
    },
};