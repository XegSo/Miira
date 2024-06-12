const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetier')
        .setDescription('Removes the premium tier of an user (Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to assign the tier')
                .setRequired(true)
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        if (int.user.id !== '687004886922952755') return;

        const user = int.options.getUser('user');
        const collection = client.db.collection("OzenCollection");

        try {
            await localFunctions.delTier(user.id, collection);
            console.log(`Tier removed for user ${user.tag}`)
        } catch (e) {
            console.log(e);
        }

        await int.editReply(`Tier removed for user ${user.tag}`);
    },
}