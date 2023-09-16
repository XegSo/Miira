const { SuggestionCache } = require('../buttons/suggestion-approve');
const { EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: `suggestion-approval`
    },
    async execute (int, client) {
        await int.deferReply({ ephemeral: true });
        const reward = Math.max(parseInt(int.fields.getTextInputValue("reward")),5000);
        if (!Number.isInteger(reward)) {
            int.editReply({content: 'Invalid amount of tokens.', ephemeral: true});
            return;
        }
        const { collection, client: mongoClient } = await connectToMongoDB();
        const logChannel = int.guild.channels.cache.get('1152347792539402250');
        try {
            const currentBalance = await localFunctions.getBalance(int.user.id, collection);
            const suggestionMessage = SuggestionCache.get(int.user.id).message;
            const suggestion = await localFunctions.getSuggestion(suggestionMessage.id);
            if (suggestion.upvotes-suggestion.downvotes < 1) {
                int.editReply({content: 'There is not enough net upvotes for this to go trough. 1 is minimal.', ephemeral: true});
                return;
            }
            const reason = int.fields.getTextInputValue("text-reason");
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
                    { name: '\u200B', value: `**Status: ${status}**\n🔺 Total Upvote count: ${suggestion.upvotes}.\n🔻 Total Downvote count: ${suggestion.downvotes}.\n✔️ Approved by <@${int.user.id}>\nReason: ${reason}` },
                );
            suggestionMessage.edit({ embeds: [updatedEmbed], components: [] });
            const newBalance = currentBalance + reward;
            await localFunctions.setBalance(suggestion.user, newBalance, collection);
            suggestionMessage.reply(`<@${suggestion.user}> Your suggestion has been approved and you've obtained ${reward} ₥.`);
            await localFunctions.liquidateSuggestion(suggestionMessage.id);
            const logEmbed = new EmbedBuilder()
              .setColor('#f26e6a')
              .setImage('https://puu.sh/JPffc/3c792e61c9.png')
              .setAuthor({ name: `✔️ New suggestion approved.`, iconURL: suggestion.embed.data.author.icon_url })
              .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
              .setDescription(`**Suggested by <@${suggestion.user}>**\n\n${suggestion.embed.data.description}\nDate: <t:${Math.floor(new Date(Date.now()) / 1000)}:F>.`)
            logChannel.send({ content: '', embeds: [logEmbed] });
            SuggestionCache.delete(int.user.id);
            int.editReply({ content: 'Suggestion successfully approved.', ephemeral: true });
        } finally {
            if (mongoClient) {
                mongoClient.close();
            }
        }
    },
};