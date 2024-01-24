const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Shows your current inventory where you can use your items.'),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        // Retrieve the user's inventory items from the database
        try {
          const userInventory = await localFunctions.getInventory(userId, collection);
          const onUse = await localFunctions.getOnUse(userId, collection);


          const inventoryEmbedTop = new EmbedBuilder()
            .setImage('https://puu.sh/JPcRE/8db81baad8.png')
            .setColor('#f26e6a');
      
          if (!userInventory || userInventory.length === 0) {
            const emptyEmbedBottom = new EmbedBuilder()
              .setDescription('\`\`\`🔐 Items on storage\`\`\`')
              .setImage('https://puu.sh/JPffc/3c792e61c9.png')
              .setColor('#f26e6a')
              .addFields({ name: 'Your inventory is empty.', value: 'Use /shop to get some items.' });
            await int.editReply({
              content: '',
              embeds: [inventoryEmbedTop, emptyEmbedBottom],
              ephemeral: true
            });
            return;
          }
      
          const options = [
            new SelectMenuBuilder()
              .setCustomId('use-item')
              .setPlaceholder('Select an item to use.')
              .addOptions(
                userInventory.map((item) => ({
                  label: item.name,
                  value: item.name,
                  description: item.value,
                }))
              ),
          ];
      
          const inventoryEmbedBottom = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a');
          inventoryEmbedBottom.setDescription('\`\`\`🔐 Items on storage\`\`\`');
          for (const item of userInventory) {
            inventoryEmbedBottom.addFields({ name:  `· ${item.name}`, value: item.desc });
          }
          
          if (onUse) {
            inventoryEmbedBottom.addFields({ name:  "\u200B", value: '\`\`\`🚀 Items on use\`\`\`' });
            for (const item of onUse) {
              inventoryEmbedBottom.addFields({ name:  `· ${item.name}`, value: item.desc });
            }
          }

          const actionRow = new ActionRowBuilder().addComponents(options);
          await int.editReply({
            content: '',
            components: [actionRow],
            embeds: [inventoryEmbedTop, inventoryEmbedBottom],
            ephemeral: true
          });
        } finally {
          mongoClient.close();
        }  
    }    
}