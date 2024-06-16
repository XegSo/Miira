const { Events } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user, client) {
        const collection = client.db.collection('ReactionRoles');
        if (user.bot) return;
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (e) {
                console.error(e);
            }
        }

        try {
            const findSystem = await localFunctions.getReactMessage(reaction.message.id, collection);
            if (!findSystem) return;
            const emoji = reaction.emoji;
            const member = await reaction.message.guild.members.cache.get(user.id);
            if (typeof findSystem.reactions.find(r => member.roles.cache.has(r.roleId)) === 'undefined' && !findSystem.many) return;
            for (const dbreaction of findSystem.reactions) {
                if (dbreaction.emojiId === `${emoji.name}:${emoji.id}`) {
                    if (!member.roles.cache.has(dbreaction.roleId)) return;
                    await member.roles.remove(dbreaction.roleId);
                    await member.send(`You've removed the ${dbreaction.roleName} role.`);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
};
