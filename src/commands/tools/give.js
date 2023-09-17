const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Assign credits to a user (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to assign credis to')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option
                .setName('amount')
                .setDescription('Amount of credits to assign')
                .setRequired(true)
        ),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;
        await int.deferReply({ ephemeral: true });
        // Check if the command has the required arguments/options
        const userId = int.options.getUser('user');
        const amount = int.options.getInteger('amount');
    
        if (!userId || !amount) {
          int.editReply({ content: 'Please provide a valid user and amount.', ephemeral: true });
          return;
        }
    
        // Establish a connection to MongoDB
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
    
        try {
          const currentBalance = await localFunctions.getBalance(userId.id, collection); // Fetch user's balance from the database
          const newBalance = currentBalance + amount;
          await localFunctions.setBalance(userId.id, newBalance, collection);
    
          int.editReply({ content: `Assigned ${amount} credits to user <@${userId.id}>.`, ephemeral: true });
        } finally {
          mongoClient.close();
        }
    }   
}