const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localConstants = require('../../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('presdel')
        .setDescription('Resets prestige (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;
        int.reply('Resetting prestige. This might take a while.');
        await int.guild.members.fetch().then(m => {
            m.forEach(async member => {
                for (const role of localConstants.rolesToRemove) {
                    if (member.roles.cache.has(role)) {
                        await member.roles.remove(role);
                        break;
                    }
                }
            });
        });
    }
};
