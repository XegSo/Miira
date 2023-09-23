const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const localConstants = require('../../constants');
const givePerksCache = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveperks')
        .setDescription('Give perks to an user (Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to assign the perks')
                .setRequired(true)
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        if (int.user.id !== '687004886922952755') return;
        const userId = int.options.getUser('user');
        const perkMenu = new SelectMenuBuilder()
                .setCustomId('set-perks')
                .setPlaceholder('Select the perks.')
                .setMinValues(1)
                .setMaxValues(17)
                
        localConstants.premiumTiers.forEach((tier) => {
            tier.perks.forEach((perk) => {
                perkMenu.addOptions({ label: perk.name , value: perk.name, description: `${tier.name} perk` })
            });
        });

        givePerksCache.set(int.user.id, {
            user: userId,
        });

        const row = new ActionRowBuilder().addComponents(perkMenu);

        int.editReply({
            components: [row]
        });
    },
    givePerksCache: givePerksCache
}