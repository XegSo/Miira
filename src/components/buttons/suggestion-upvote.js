const { EmbedBuilder, Events, Partials, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'suggestion-upvote'
    },
    async execute (int, client) {
        await int.deferReply({ ephemeral: true });
        const suggestion = await localFunctions.getSuggestion(int.message.id);
        if (suggestion.status === 'Approved.' || suggestion.status === 'Denied.') return;
        let voters = suggestion.voters;
        if (voters.some((voter) => voter === int.user.id)) {
            int.editReply({content: 'You cannot vote again or vote your own suggestion.', ephemeral: true});
            return;
        }
        voters.push(int.user.id);
        let upvotes = suggestion.upvotes+1;
        let downvotes = suggestion.downvotes;
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
                        { name: '\u200B', value: `**Status: ${suggestion.status}**\n**Click on 🔺 to upvote.**\nTotal upvotes: ${upvotes}\n\nClick on 🔻 to downvote.\nTotal downvotes: ${downvotes}\n\n*Only admins can click on ✔️ or ❌.*\n` },
                    );
        int.message.edit({ embeds: [updatedEmbed] });
        int.editReply({content: 'You\'ve successfully voted.', ephemeral: true});
        await localFunctions.updateSuggestion(int.message.id, suggestion.user, suggestion.status, updatedEmbed, upvotes, downvotes, voters);
    },
};