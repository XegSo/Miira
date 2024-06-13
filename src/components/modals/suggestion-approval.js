const { SuggestionCache } = require('../buttons/suggestion-approve');
const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'suggestion-approval'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const reward = Math.min(parseInt(int.fields.getTextInputValue('reward')), 5000);

        if (!Number.isInteger(reward)) {
            await int.editReply({ content: 'Invalid amount of tokens.', ephemeral: true });
            return;
        }

        const collection = client.db.collection('OzenCollection');
        const logChannel = int.guild.channels.cache.get('1152347792539402250');

        const suggestionMessage = SuggestionCache.get(int.user.id).message;
        const suggestion = await localFunctions.getSuggestion(client, suggestionMessage.id);
        const currentBalance = await localFunctions.getBalance(suggestion.user, collection);

        if (suggestion.upvotes - suggestion.downvotes < 1) {
            await int.editReply({ content: 'There is not enough net upvotes for this to go trough. 1 is minimal.', ephemeral: true });
            return;
        }

        const reason = int.fields.getTextInputValue('text-reason');
        let status = 'Approved.';
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
                { name: '\u200B', value: `**Status: ${status}**\n\n🔺 Total Upvote count: ${suggestion.upvotes}.\n🔻 Total Downvote count: ${suggestion.downvotes}.\n🟢 Approved by <@${int.user.id}>\nReason: ${reason}` }
            );
        suggestionMessage.edit({ embeds: [updatedEmbed], components: [] });
        const newBalance = currentBalance + reward;
        await localFunctions.setBalance(suggestion.user, newBalance, collection);
        suggestionMessage.reply(`<@${suggestion.user}> Your suggestion has been approved and you've obtained ${reward} ₥.`);
        await localFunctions.liquidateSuggestion(client, suggestionMessage.id);
        const logEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setAuthor({ name: '🟢 New suggestion approved.', iconURL: suggestion.embed.data.author.icon_url })
            .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
            .setDescription(`**Suggested by <@${suggestion.user}>\nApproved by <@${int.user.id}>**\n\n${suggestion.embed.data.description}\n\nDate: <t:${Math.floor(new Date(Date.now()) / 1000)}:F>.`);
        logChannel.send({ content: '', embeds: [logEmbed] });
        SuggestionCache.delete(int.user.id);
        await int.editReply({ content: 'Suggestion successfully approved.', ephemeral: true });
    }
};
