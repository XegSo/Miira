const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleancart')
        .setDescription('Cleans an user\'s cart (Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User which cart will get reset')
                .setRequired(true)
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        if (int.user.id !== '687004886922952755') return;
        const user = int.options.getUser('user');
        const collection = client.db.collection('OzenCollection');

        await localFunctions.delCart(user.id, collection);
        await int.editReply(`Cart cleared for user ${user.tag}`);
    },
}