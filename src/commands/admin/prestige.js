const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const json = require('../../Schemas/Prestige.json');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prestige')
        .setDescription('Sets prestige (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;
        const channel_update = await client.channels.cache.get('785727123808583721');
        const channel_warn = await client.channels.cache.get('874227481442398208');

        int.reply("Starting to set new prestige. This might take a while");

        for (const obj of json) {
            try {
                const memberId = obj['Discord ID'];
                const member = await int.guild.members.fetch(memberId);


                if (!member) {
                console.log(`${memberId} is not in the server`);
                channel_warn.send({ content: `User with ID ${memberId} is no longer in the server. Prestige has been set to 0.` });
                continue;
                }

                const prestigeRole = localFunctions.getRoleIDByPrestige(obj.Prestige);
                const hasPrestigeRole = member.roles.cache.has(prestigeRole);

                if (!hasPrestigeRole) {
                await member.roles.add(prestigeRole);

                if (!member.roles.cache.has('963295216910077962')) {
                    await member.roles.add('963295216910077962');
                }

                channel_update.send({ content: `<@${memberId}> Your collab prestige level is now **${obj.Prestige}**.` });
                }
            } catch (err) {
                console.log(`Error processing user ${obj['Discord ID']}:`, err);
            }
        }
    }    
}