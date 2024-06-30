const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Gracefully shuts down the bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(int, client) {
        await int.reply({
            content: 'Shutting down',
            ephemeral: true
        });

        await client.mongoClient.close();
        await client.destroy();
        process.exit();
    }
};
