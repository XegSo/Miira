const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmonthlysupporter')
        .setDescription('Add an user to the monthly payment system (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') {
            await int.reply('You are not allowed to do this!');
            return;
        }

        const reply = await int.reply({
            content: 'Please reply to this message with a JSON attachment.',
            fetchReply: true
        });

        const filter = (m) => m.author.id === int.user.id && m.reference.messageId === reply.id && m.attachments.size > 0;
        const collector = int.channel.createMessageCollector({ filter, time: 120_000, max: 1 });

        collector.on('collect', async (message) => {
            const attachment = message.attachments.first();

            if (!attachment.name.endsWith('.json')) {
                await message.reply('Not a json file.');
                return;
            }

            try {
                const response = await fetch(attachment.url);
                const jsonData = await response.json();
                const collection = client.db.collection('OzenCollection');

                for (const item of jsonData) {
                    const premiumDiscordId = item.discordId;
                    delete item.name;
                    delete item.discordId;
                    await localFunctions.setUserMontlyPremium(premiumDiscordId, item, collection);
                }

                await message.reply('User data pushed successfully.');
            } catch (err) {
                console.error(err);
                await message.reply(`Error: \`${err}\``);
            }
        });
    }
};
