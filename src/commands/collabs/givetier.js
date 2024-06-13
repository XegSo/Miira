const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const localConstants = require('../../constants');
const giveTierCache = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givetier')
        .setDescription('Give a premium tier to an user (Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to assign the tier')
                .setRequired(true)
        ),
    async execute(int) {
        await int.deferReply({ ephemeral: true });
        if (int.user.id !== '687004886922952755') return;
        const userId = int.options.getUser('user');
        const perkMenu = new SelectMenuBuilder()
            .setCustomId('set-tier')
            .setPlaceholder('Select the tier.');

        localConstants.premiumTiers.forEach((tier) => {
            perkMenu.addOptions({ label: tier.name, value: tier.name, description: `${tier.name}` });
        });

        giveTierCache.set(int.user.id, {
            user: userId
        });

        const row = new ActionRowBuilder().addComponents(perkMenu);

        await int.editReply({
            components: [row]
        });
    },
    giveTierCache: giveTierCache
};
