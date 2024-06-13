const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { userConfirmationCache } = require('../selectMenus/buy-item');

module.exports = {
    data: {
        name: 'buy-yes'
    },
    async execute(int, client) {
        // Get the user's confirmation from the cache
        const userConfirmation = userConfirmationCache.get(int.user.id);
        if (!userConfirmation) return;
        const userId = int.user.id;
        const purchasedItem = userConfirmation.item;
        const purchasedItemValue = parseInt(purchasedItem.value.replace(/[^\d]/g, ''));

        // Grab the MongoDB collection.
        const collection = client.db.collection('OzenCollection');

        // Check if the user has enough tokens
        const currentBalance = await localFunctions.getBalance(userId, collection);

        // Retrieve the user's current inventory from the database
        let userInventory = await localFunctions.getInventory(userId, collection) || [];

        // Check if userInventory is an array, if not, initialize it as an empty array
        if (!Array.isArray(userInventory)) {
            userInventory = [];
        }

        if (!userInventory.some((item) => item.name === purchasedItem.name)) {
            // Deduct the tokens
            const newBalance = currentBalance - purchasedItemValue;
            await localFunctions.setBalance(userId, newBalance, collection);

            // Add the purchased item to the user's inventory
            userInventory.push(purchasedItem);

            // Save the updated inventory back to the database
            await localFunctions.setInventory(userId, userInventory, collection);

            int.reply({ content: `You have successfully purchased ${purchasedItem.name}! Make sure to check your inventory with the command \`\`/inventory\`\` to use your item.`, ephemeral: true });

            const purchasesLogChannel = int.guild.channels.cache.get('1150891338166976553');
            const purchasesLogEmbed = new EmbedBuilder()
                .setColor('#f26e6a')
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                .setAuthor({ name: '✔️ A new purchase has been made.', iconURL: int.user.displayAvatarURL() })
                .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
                .setDescription(`**Item: ${purchasedItem.name}**\n**Purchased by <@${int.user.id}>**\n**Value: ${purchasedItemValue} ₥**\nDate: <t:${Math.floor(new Date(Date.now()) / 1000)}:F>.`)
                .setTimestamp();
            purchasesLogChannel.send({ content: '', embeds: [purchasesLogEmbed] });

            // Remove the user's confirmation from the cache
            userConfirmationCache.delete(int.user.id);
        } else {
            await int.reply({ content: `You already have ${purchasedItem.name}.`, ephemeral: true });
        }
    }
};
