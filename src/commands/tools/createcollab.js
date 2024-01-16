const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createcollab')
        .setDescription('(Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Collab name')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Collab type')
                .setRequired(true)
                .addChoices(
                    { name: 'Pooled', value: 'pooled' },
                    { name: 'Not Pooled', value: 'not_pooled' },
                ),
        )
        .addStringOption(option =>
            option.setName('restriction')
                .setDescription('Collab join restriction')
                .setRequired(true)
                .addChoices(
                    { name: 'Staff', value: 'staff' },
                    { name: 'Deluxe', value: 'deluxe' },
                    { name: 'Megacollab', value: 'megacollab' },
                    { name: 'Prestige', value: 'prestige' },
                    { name: 'Experimental', value: 'experimental' },
                    { name: 'None', value: 'none' },
                ),
        )
        .addStringOption(option =>
            option.setName('openingdate')
                .setDescription('Collab opening date in unix')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('Collab topic')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('userlimit')
                .setDescription('If set to 0, the collab is limitless.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('spreadsheet')
                .setDescription('ID of the spreadsheet if any')
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        if (int.user.id !== '687004886922952755') return;
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        let collabObj = {
            name: int.options.getString('name'),
            type: int.options.getString('type'),
            topic: int.options.getString('topic'),
            status: "closed",
            restriction: int.options.getString('restriction'),
            opening: int.options.getString('openingdate'),
            user_cap: int.options.getInteger('userlimit'),
            spreadsheetID: int.options.getString('spreadsheet') || null,
        }
        try {
            await localFunctions.setCollab(collabObj, collection);
            int.editReply('New collab created succesfully in the database.')
        } catch (e) {
            console.log(e);
            int.editReply('Something went wrong...')
        } finally {
            mongoClient.close();
        }
    },
}