const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the top 10 users with more Credits.')
        .addStringOption(option => 
            option
                .setName('choice')
                .setDescription('Type of the leaderboard')
                .setRequired(true)
                .addChoices(
                { name: 'tokens', value: 'tokens' },
                { name: 'combo', value: 'combo' },
                )
        ),
    async execute(int, client) {
        await int.deferReply();
        const leaderboardType = int.options.getString('choice');
        if (leaderboardType === 'tokens' || leaderboardType == null) {
            // Prepare the leaderboard data for the embed
            let leaderboardDataTokens = await localFunctions.updateLeaderboardData('tokens');
            const TopEmbed = new EmbedBuilder()
                .setImage('https://puu.sh/JPdfL/9b2860ac7a.png')
                .setColor('#f26e6a');
            const TokensEmbed = localFunctions.createLeaderboardEmbedTokens(leaderboardDataTokens);
            // Send the embed as a response

            await int.editReply({ content: '', embeds: [TopEmbed, TokensEmbed] });
        } else {
            let leaderboardDataCombo = await localFunctions.updateLeaderboardData('combo');
            const TopEmbed = new EmbedBuilder()
                .setImage('https://puu.sh/JPdfL/9b2860ac7a.png')
                .setColor('#f26e6a');
            const ComboEmbed = localFunctions.createLeaderboardEmbedCombo(leaderboardDataCombo);
            await int.editReply({ content: '', embeds: [TopEmbed, ComboEmbed] }); 
        }       
    }    
}