const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
  data: {
    name: 'delete-cart-items'
  },
  async execute(int, client) {
    await int.deferReply({ ephemeral: true });
    const userId = int.user.id;
    const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
    try {
      const itemsToDelete = int.values;
      let userItemsInCart = await localFunctions.getCart(userId, collection);
      let newCart = userItemsInCart.filter((e) => !itemsToDelete.includes(e.name));
      await localFunctions.setCart(userId, newCart, collection);
      let messageComponents = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('shopping-cart')
          .setLabel('🛒 Check your cart')
          .setStyle('Success'),    
      )
      await int.editReply({
        content: "Your cart has been updated.",
        components: [messageComponents],
      });
    } finally {
      mongoClient.close();
    }
  }
};