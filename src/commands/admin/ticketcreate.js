const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder } = require('discord.js');
const { ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketcreate')
        .setDescription('Create a ticket system. (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('channelid')
                .setDescription('Insert the channel ID for the embed')
                .setRequired(true)
        ),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;
        await int.deferReply({ ephemeral: true });
        const channel = int.guild.channels.cache.get(int.options.getString('channelid'));

        if (!channel) {
            await int.editReply({ content: 'Please provide a channel Id.', ephemeral: true });
            return;
        }
        const TicketTopEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setImage('https://puu.sh/JPEsp/c792ff3de7.png');
        const TicketEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setTitle('Contact staff via Ticket.')
            .setDescription('Click on the button bellow to contact staff to discuss any matter on a private channel. Keep in mind rules still apply on there.');
        await channel.send({
            content: '',
            embeds: [TicketTopEmbed, TicketEmbed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('create-ticket')
                        .setLabel('🎫 Create a Ticket.')
                        .setStyle('Primary')
                )
            ],
            ephemeral: true
        });
        await int.editReply({ content: 'Embed created succesfully', ephemeral: true });
    }
};
