const { SlashCommandBuilder } = require('discord.js');
const localFunctions = require('../../functions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('referral')
        .setDescription('Shows your referral code.'),
    async execute(int, client) {
        localFunctions.handleReferralCommand(int)
        .then((code) => {
          int.reply({ content: `Your referral code is ${code}`, ephemeral: true });
        })
        .catch((error) => {
          console.error('Error handling referral command:', error);
          int.reply({ content: 'An error occurred while generating your referral code.', ephemeral: true });
        });
    }    
}