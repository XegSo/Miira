const { SlashCommandBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggest something for the server or collabs.'),
  async execute(int, client) {
    const modal = new ModalBuilder()
      .setCustomId(`suggest-modal`)
      .setTitle('Send a suggestion');

    const title = new TextInputBuilder()
      .setCustomId('suggestion-title')
      .setLabel('Resume your suggestion in a few words.')
      .setPlaceholder('Ex: Adding x to the collabs.')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const suggestion = new TextInputBuilder()
      .setCustomId('suggestion')
      .setLabel('What are you suggesting?')
      .setPlaceholder('Note: If you suggest a lot of useless things, you will be muted. ')
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const reason = new TextInputBuilder()
      .setCustomId('suggestion-reason')
      .setLabel('Why is this suggestion?')
      .setPlaceholder('Specify how the implementation of this suggestion will be benefitial for the server or the collabs.')
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(title), new ActionRowBuilder().addComponents(suggestion), new ActionRowBuilder().addComponents(reason));

    await int.showModal(modal);
  }
}