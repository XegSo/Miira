const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const removePerksCache = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeperks')
        .setDescription('Remove perks to an user (Admin Only).')
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
        const user = int.options.getUser('user');
        const perkMenu = new SelectMenuBuilder()
                .setCustomId('remove-perks')
                .setPlaceholder('Select the perks.')
                .setMinValues(1)

        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");        

        main: try {
            const userPerks = await localFunctions.getPerks(user.id, collection);
            if (userPerks.length === 0) {
                int.editReply('The user has no perks in the database.');
                break main;
            }
            userPerks.forEach((perk) => {
                perkMenu.addOptions({ label: perk.name , value: perk.name, description: `${perk.name}` })
            });
    
            removePerksCache.set(int.user.id, {
                user: user,
            });

            perkMenu.setMaxValues(perkMenu.options.length);
            const row = new ActionRowBuilder().addComponents(perkMenu);
    
            int.editReply({
                components: [row]
            });
        } finally {
            mongoClient.close();
        }
      
    },
    removePerksCache: removePerksCache
}