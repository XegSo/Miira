/* const { EmbedBuilder, Events, Partials, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');


module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
        const { partials } = client;
        if (reaction.emoji.name === '✔️') {
            if (!localConstants.staffUserIds.includes(user.id)) {
                // Remove the reaction if the user doesn't have the required role
                reaction.users.remove(user);
                return;
            }
            if (user.id === localConstants.botId) return;
            if (reaction.message.channelId !== '880953549561954314') return;
            if (reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    console.error('Something went wrong when fetching the reaction:', error);
                    return;
                }
            }
            const suggestion = await localFunctions.getSuggestion(client, reaction.message.id);
            if (!suggestion) {
                console.log('Something went wrong.');
                return;
            }
            if (suggestion.status === 'Approved.') return;
            const collection = client.db.collection("OzenCollection");

            const currentBalance = await localFunctions.getBalance(suggestion.user, collection);
            const suggestionChannel = reaction.message.channel;
            let status = 'Approved.';
            const upvoteCount = reaction.message.reactions.cache.get('🔺').count - 1; // Subtract 1 to exclude the bot's reaction
            const downvoteCount = reaction.message.reactions.cache.get('🔻').count - 1; // Subtract 1 to exclude the bot's reaction
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
                    { name: '\u200B', value: `**Status: ${status}**\n🔺 Total Upvote count: ${upvoteCount}.\n🔻 Total Downvote count: ${downvoteCount}.\n✔️ Approved by <@${user.id}>\n` },
                );
            reaction.message.edit({ embeds: [updatedEmbed] });
            const newBalance = currentBalance + 5000;
            await localFunctions.setBalance(suggestion.user, newBalance, collection);
            suggestionChannel.send(`<@${suggestion.user}> Your suggestion has been approved and you've obtained 5000 ₥.`);
            await localFunctions.updateSuggestion(client, reaction.message.id, suggestion.user, status, updatedEmbed);
        }
    }
}*/
