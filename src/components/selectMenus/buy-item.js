const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const userConfirmationCache = new Map();

module.exports = {
  data: {
    name: 'buy-item'
  },
  async execute(int, client) {
    const userId = int.user.id;
    const itemName = int.values[0]; // Get the selected item from the dropdown
    const selectedItem = localConstants.shopItems.find((item) => item.name === itemName);
    if (!itemName || !selectedItem) return;

    const { collection, client: mongoClient } = await connectToMongoDB();

    if ((selectedItem.name === "Novice Active Member Role" && int.member.roles.cache.has('1150870507445563452')) || (selectedItem.name === "Advanced Active Member Role" && int.member.roles.cache.has('1150870529104949330')) || (selectedItem.name === "Ultimate Active Member Role" && int.member.roles.cache.has('1150870546842660904'))) {
      int.reply({ content: `You already have this item active!`, ephemeral: true });
      return;
    }

    try {
      const currentBalance = await localFunctions.getBalance(userId, collection); // Fetch user's balance from the database
      let userInventory = await localFunctions.getInventory(userId, collection) || [];

      if (currentBalance >= parseInt(selectedItem.value.replace(',', '')) && !userInventory.some((item) => item.name === selectedItem.name)) {
        // Create a verification message with Yes and No buttons
        const verificationMessage = await int.reply({
          content: `Are you sure you want to buy ${selectedItem.name} for ${selectedItem.value}?`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('buy-yes')
                .setLabel('Yes')
                .setStyle('Success'),
              new ButtonBuilder()
                .setCustomId('buy-no')
                .setLabel('No')
                .setStyle('Danger')
            ),
          ],
          ephemeral: true,
        });

        // Store the item and the verification message ID in a temporary cache
        userConfirmationCache.set(int.user.id, {
          item: selectedItem,
          verificationMessageId: verificationMessage.id,
          verificationMessageChannel: int.channel.id,
        });
      } else if (userInventory.some((item) => item.name === selectedItem.name)) {
        int.reply({ content: `You already have ${selectedItem.name}.`, ephemeral: true });
      } else {
        int.reply({ content: 'You do not have enough tokens to make this purchase.', ephemeral: true });
      }
    } finally {
      mongoClient.close();
    }
  },
  userConfirmationCache: userConfirmationCache
};