const { InteractionType } = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    async execute(int, client) {
        if (int.isCommand()) {
            const { commands } = client;
            const { commandName } = int;
            const command = commands.get(commandName);
            if (!command) return;

            try {
                await command.execute(int, client);     
            } catch (error) {
                console.error(error);
                int.reply({
                    content: 'Something went wrong.',
                    ephemeral: true
                });
            }
        } else if (int.isButton()) {
            const { buttons } = client;
            const { customId } = int;
            const button = buttons.get(customId);
            if (!button) return new Error('No code for this button');

            try {
                await button.execute(int, client);
            } catch (error) {
                console.error(error);
            }
        } else if (int.isStringSelectMenu()) {
            const { selectMenus } = client;
            const { customId } = int;
            const menu = selectMenus.get(customId);
            if (!menu) return new Error('No code for this menu');

            try {
                await menu.execute(int, client);
            } catch (error) {
                console.error(error);
            }
        } else if (int.type === InteractionType.ModalSubmit) {
            const { modals } = client;
            const { customId } = int;
            const modal = modals.get(customId);
            if (!modal) return new Error('No code for this modal');

            try {
                await modal.execute(int, client);
            } catch (error) {
                console.error(error);
            }
        }
    }
}