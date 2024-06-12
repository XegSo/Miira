const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localFunctions = require('../../functions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('globalboost')
        .setDescription('Sets a global boost for the obtained tokens in a given amount of time (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option
                .setName('multiplier')
                .setDescription('Multiplier')
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName('timer')
                .setDescription('Time in hours')
                .setRequired(true)
        ),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;
        const multiplier = parseFloat(int.options.getString('multiplier'));
        const boostDuration = parseFloat(int.options.getString('timer'));

        if (isNaN(multiplier) || isNaN(boostDuration)) {
          int.reply({ content: 'Please provide valid numerical values for multiplier and timer.', ephemeral: true });
          return;
        }

        await localFunctions.applyGlobalBoost(multiplier, boostDuration, client);
        await int.reply({ content: `Global boost of ${multiplier}x for ${boostDuration} hours has been applied.`, ephemeral: true });
    }    
}