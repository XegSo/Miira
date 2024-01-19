const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'premium-info'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });

        const premiumEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setDescription('**\`\`\`ml\n 🚀 Welcome to the premium section!\`\`\`**                                                                                                           **In this section, you can find information about the current premium tiers and their perks!**\n\n**• The perks are ACCUMULATIVE.** \n**• After one collab, most perks will need to be RENEWED.** \n**• If there is no renewal, there is a DECAY into former supporter.**\n**• You can also purchase SINGLE PERKS for single use in collabs.**\n**• Premium includes bump immunity.**')
            .addFields(
                { name: ` `, value: `**\`\`\`ml\n⚠️ Only the prominent perks are mentioned for each tier.\`\`\`**` }, 
                { name: ` `, value: `\`\`🎫 Mirage I Premium | Price: 5$\`\`\n └ Exclusive profile picture version.` },
                { name: ` `, value: `\`\`🎫 Mirage II Premium | Price: 10$\`\`\n └ Animated Banner.` },
                { name: ` `, value: `\`\`🎫 Mirage III Premium | Price: 15$\`\`\n └ Animated Stream Overlay.` },
                { name: ` `, value: `\`\`🎫 Mirage IV Premium | Price: 20$\`\`\n └ Early collab delivery.\n` },
                { name: ` `, value: `\`\`🎫 Mirage V Premium | Price: 40$\`\`\n └ Customized collab themed osu! skin.` },
                { name: ` `, value: `\`\`🎫 Mirage VI Premium | Price: 100$\`\`\n └ Collab early access.` },
                { name: ` `, value: `\`\`🎫 Mirage VII Premium | Price: 250$\`\`\n └ Host your own megacollab.` },
                { name: ` `, value: `**\`\`\`prolog\n💎 Find the full details about each tier in the list bellow.\`\`\`\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>**` }, 
            )
            .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })

        mainComponents = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('premium-tiers')
                .setPlaceholder('Check the detailed tiers.')
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
            components: [mainComponents]
        });

    }
}