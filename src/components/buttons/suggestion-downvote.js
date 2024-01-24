const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'suggestion-downvote'
    },
    async execute (int, client) {
        await int.deferReply({ ephemeral: true });
        const suggestion = await localFunctions.getSuggestion(int.message.id);
        if (suggestion.status === 'Approved.' || suggestion.status === 'Denied.') return;
        let voters = suggestion.voters;
        if (suggestion.user === int.user.id) {
            await int.editReply({content: 'You cannot downvote your own suggestion.', ephemeral: true});
            return;
        }
        if (voters.downvoters.some((voter) => voter === int.user.id)) {
            await int.editReply({content: 'You cannot downvote this suggestion again.', ephemeral: true});
            return;
        }
        voters.downvoters.push(int.user.id);
        let upvotes = voters.upvoters.some((voter) => voter === int.user.id) ? suggestion.upvotes-1 : suggestion.upvotes;
        let downvotes = suggestion.downvotes+1;
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
                        { name: '\u200B', value: `**Status: ${suggestion.status}**\n\nClick on 🔺 to upvote.\nTotal upvotes: ${upvotes}\n\nClick on 🔻 to downvote.\nTotal downvotes: ${downvotes}\n\n*Only admins can click on ✅ or ❎.*\n` },
                    );
        int.message.edit({ embeds: [updatedEmbed] });
        await int.editReply({content: 'You\'ve successfully voted.', ephemeral: true});
        await localFunctions.updateSuggestion(int.message.id, suggestion.user, suggestion.status, updatedEmbed, upvotes, downvotes, voters);
    },
};