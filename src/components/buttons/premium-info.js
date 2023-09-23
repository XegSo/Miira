const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'premium-info'
    },
    async execute(int, client) {
        await int.deferReply();

        const premiumEmbed = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .setDescription('\`\`\`🚀 Welcome to the premium section!\`\`\`\n**In this section, you can find information about the current premium tiers and their perks!**\n\n• The perks are accumulative and the starter ones are valid for one collab. \n• After one collab, the perks will need to be renewed. \n• If there is no renewal, there is a decay into *former supporter* and the renewal prices won\'t be able to be used anymore unless premium is purchased again.\n• You can also purchase single perks for single use in collabs.\n• Premium includes bump immunity.\n\nOnly the **prominent** perks are mentioned for each tier on this embed.')
            .addFields(
                { name: ` `, value: `\`\`🎫 Mirage I Premium | Price: 5$\`\`\n └ Exclusive profile picture version.` },
                { name: ` `, value: `\`\`🎫 Mirage II Premium | Price: 10$\`\`\n └ Animated Banner.` },
                { name: ` `, value: `\`\`🎫 Mirage III Premium | Price: 15$\`\`\n └ Animated Stream Overlay.` },
                { name: ` `, value: `\`\`🎫 Mirage IV Premium | Price: 20$\`\`\n └ Early collab delivery.\n` },
                { name: ` `, value: `\`\`🎫 Mirage V Premium | Price: 40$\`\`\n └ Customized collab themed osu! skin.` },
                { name: ` `, value: `\`\`🎫 Mirage VI Premium | Price: 100$\`\`\n └ Collab early access.` },
                { name: ` `, value: `\`\`🎫 Mirage VII Premium | Price: 250$\`\`\n └ Host your own megacollab.\n\n **You can find the full information about each tier in the list bellow.**` },
            );

        mainComponents = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('premium-tiers')
                .setPlaceholder('Check the detailed perks.')
                .addOptions([
                    { label: 'Mirage I', value: 'Mirage I', description: 'Cost: 5$.' },
                    { label: 'Mirage II', value: 'Mirage II', description: 'Cost: 10$.' },
                    { label: 'Mirage III', value: 'Mirage III', description: 'Cost: 15$.' },
                    { label: 'Mirage IV', value: 'Mirage IV', description: 'Cost: 20$.' },
                    { label: 'Mirage V', value: 'Mirage V', description: 'Cost: 40$.' },
                    { label: 'Mirage VI', value: 'Mirage VI', description: 'Cost: 100$.' },
                    { label: 'Mirage VII', value: 'Mirage VII', description: 'Cost: 250$.' },
                ])
        )

        int.editReply({
            content: '',
            embeds: [premiumEmbed],
            components: [mainComponents],
            ephemeral: true
        });

    }
}