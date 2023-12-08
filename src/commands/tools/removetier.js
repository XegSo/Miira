const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
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
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            await localFunctions.delTier(user.id,collection);
            console.log(`Tier removed for user ${user.tag}`)
        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
        }

        int.editReply(`Tier removed for user ${user.tag}`);
    },
}