const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setperkstatus')
        .setDescription('Change the perk usage status (Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('switch')
                .setDescription('Set status [on/off].')
                .setRequired(true)
                .addChoices(
                    { name: 'on', value: 'on' },
                    { name: 'off', value: 'off' }
                )
        )
        .addIntegerOption(option =>
            option
                .setName('decaydate')
                .setDescription('Decay date in UNIX epoch.')
                .setRequired(true)
        ),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;

        const status = int.options.getString('switch');
        const decayDate = int.options.getInteger('decaydate');
        let newStatus = 0;
        const collection = client.db.collection('Special');

        if (status === 'on') {
            newStatus = 1;
        }

        try {
            await localFunctions.setPerkUsage(newStatus, collection);
            await localFunctions.setPerkStartingDecayDate(decayDate, collection);
            await int.reply({ content: `New perk usage status: ${status}`, ephemeral: true });
        } catch (error) {
            await int.reply({ content: `Something went wrong: ${error}`, ephemeral: true });
        }
    }
};
