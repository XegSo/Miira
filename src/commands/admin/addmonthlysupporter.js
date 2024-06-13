const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const monthlySupporterCache = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmonthlysupporter')
        .setDescription('Add an user to the monthly payment system (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(int, client) {
        await int.deferReply();

        if (int.user.id !== '687004886922952755') {
            await int.editReply('You are not allowed to do this!');
            return;
        }

        int.editReply('Please reply to this message with a JSON attatchment.');
        const replyMessage = await int.fetchReply();
        monthlySupporterCache.set(int.user.id, {
            userId: int.user.id,
            messageId: replyMessage.id

        });
    },
    monthlySupporterCache: monthlySupporterCache
};
