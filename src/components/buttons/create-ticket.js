const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const userTicketCache = new Map();

module.exports = {
    data: {
        name: 'create-ticket'
    },
    async execute (int, client) {
        const logChannel = int.guild.channels.cache.get('932911199773937674');
        const userId = int.user.id;
        const guild = int.guild;
        const categoryId = '932717314560909392';
        const category = guild.channels.cache.get(categoryId);
        guild.channels.create({
          name: `ticket-${int.user.tag}`,
          type: ChannelType.GuildText,
          parent: category,
          permissionOverwrites: [
            {
              id: guild.roles.everyone, // @everyone role
              deny: [PermissionsBitField.Flags.ViewChannel], // Deny view permissions by default
            },
            {
              id: userId, // User who requested the channel
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],// Allow view and send messages
            },
            {
              id: '961891383365500938', // Role ID that should have access
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],// Allow view and send messages
            },
          ],
        })
          .then(async (channel) => {
            // You can send a message in the new channel or update the user with a response here
            int.reply({ content: `Ticket channel created: ${channel}`, ephemeral: true });
            const delEmbed = new EmbedBuilder()
              .setColor('#f26e6a')
              .setImage('https://puu.sh/JPffc/3c792e61c9.png')
              .setThumbnail(int.user.displayAvatarURL())
              .setTitle(`New ticket for user ${int.user.tag}.`)
              .setDescription('Click on the button bellow to close the ticket.');
            await channel.send({
              content: `<@${userId}>`,
              embeds: [delEmbed],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('close-ticket')
                    .setLabel('🎫 Close the ticket.')
                    .setStyle('Danger')
                ),
              ],
              ephemeral: true,
            });
            userTicketCache.set(0, {
              user: int.user,
              avatar: int.user.displayAvatarURL()
            });
            const CreatedEmbed = new EmbedBuilder()
              .setColor('#f26e6a')
              .setImage('https://puu.sh/JPffc/3c792e61c9.png')
              .setAuthor({ name: "✔️ A ticket has been opened.", iconURL: int.user.displayAvatarURL() })
              .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
              .setDescription(`Opened by <@${int.user.id}>\nDate: <t:${Math.floor(new Date(Date.now()) / 1000)}:F>.`)
              .setTimestamp();
            logChannel.send({ content: '', embeds: [CreatedEmbed] });
          })
          .catch((error) => {
            console.error('Error creating ticket channel:', error);
            int.reply({ content: 'An error occurred while creating the ticket channel.', ephemeral: true });
          });
    },
    userTicketCache: userTicketCache 
}