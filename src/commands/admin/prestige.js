const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { user } = require('osu-api-extended/dist/api/v1');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prestige')
        .setDescription('Sets prestige (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(int, client) {
        await int.deferReply();
        if (int.user.id !== '687004886922952755') return;
        const channel_update = await client.channels.cache.get('785727123808583721');
        const channel_warn = await client.channels.cache.get('874227481442398208');

        /*const userNames = [ use if no IDs
            "breadrick",
            "s.osms.smsosmsnsomsos.snmsnmsnms",
            ]*/

        let users = [
            
        ]

        /*for (const name of userNames) {
            let nameId = client.users.cache.find(u => u.username === name)
            if (typeof nameId !== "undefined") {
                users.push(nameId.id);
            } else {
                console.log(`User ${name} not found`)
            }
        }*/

        int.editReply("Starting to set new prestige. This might take a while");

        for (const user of users) {
            const memberId = user;
            const member = await int.guild.members.fetch(memberId);

            if (!member) {
                console.log(`${memberId} is not in the server`);
                channel_warn.send({ content: `User with ID ${memberId} is no longer in the server. Prestige has been set to 0.` });
                continue;
            }

            let prestigeLevel = 0;
            let prestige = member.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
            if (typeof prestige !== "undefined") {
                prestige = prestige.name;
                prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
            } else {
                prestigeLevel = 0;
            }

            if (!member.roles.cache.has('963295216910077962')) {
                await member.roles.add('963295216910077962');
            }

            let oldPrestigeRole = localFunctions.getRoleIDByPrestige(prestigeLevel.toString());
            let newPrestige = prestigeLevel + 1;
            let newPrestigeRole = localFunctions.getRoleIDByPrestige(newPrestige.toString());
            if (oldPrestigeRole) {
                await member.roles.remove(oldPrestigeRole);
            }
            await member.roles.add(newPrestigeRole);
            channel_update.send({ content: `<@${memberId}> Your collab prestige level is now **${newPrestige}**.` });
        }
    }
}