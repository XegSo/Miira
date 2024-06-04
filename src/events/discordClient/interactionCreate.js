const { InteractionType } = require('discord.js')
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

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
        } else if (int.isAutocomplete()) {
            if (int.commandName === 'collabs') {
                if (int.options.getSubcommand() === "join") {
                    const focusedValue = int.options.getFocused();
                    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                    try {
                        const allCollabs = await localFunctions.getCollabs(collection);
                        const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                        if (typeof openMegacollab === "undefined") {
                            return;
                        } else {
                            const availablePicks = openMegacollab.pool.items.filter(i => i.status === "available");
                            const filteredChoices = availablePicks.filter((pick) =>
                                pick.name.toLowerCase().startsWith(focusedValue.toLowerCase())
                            );
                            const results = filteredChoices.map((choice) => {
                                return {
                                    name: `${choice.name} - ${choice.series}`,
                                    value: choice.id
                                }
                            });

                            int.respond(results.slice(0, 25)).catch(() => {});
                        }
                    } finally {
                        mongoClient.close();
                    }
                }
                if (int.options.getSubcommand() === "manage") {
                    const focusedValue = int.options.getFocused();
                    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                    try {
                        const allCollabs = await localFunctions.getCollabs(collection);
                        const filteredChoices = allCollabs.filter((collab) =>
                            collab.name.toLowerCase().startsWith(focusedValue.toLowerCase())
                        );
                        const results = filteredChoices.map((choice) => {
                            return {
                                name: `${choice.name}`,
                                value: choice.name
                            }
                        });

                        int.respond(results.slice(0, 25)).catch(() => {});
                    } finally {
                        mongoClient.close();
                    }
                }
                if (int.options.getSubcommand() === "swap") {
                    const focusedValue = int.options.getFocused();
                    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                    try {
                        const allCollabs = await localFunctions.getCollabs(collection);
                        const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                        if (typeof openMegacollab === "undefined") {
                            return;
                        } else {
                            const availablePicks = openMegacollab.pool.items.filter(i => i.status === "available");
                            const filteredChoices = availablePicks.filter((pick) =>
                                pick.name.toLowerCase().startsWith(focusedValue.toLowerCase())
                            );
                            const results = filteredChoices.map((choice) => {
                                return {
                                    name: `${choice.name} - ${choice.series}`,
                                    value: choice.id
                                }
                            });

                            int.respond(results.slice(0, 25)).catch(() => {});
                        }
                    } finally {
                        mongoClient.close();
                    }
                }
                if (int.options.getSubcommand() === "trade") {
                    const focusedValue = int.options.getFocused();
                    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                    try {
                        const allCollabs = await localFunctions.getCollabs(collection);
                        const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && c.status === "open");
                        if (typeof openMegacollab === "undefined") {
                            return;
                        } else {
                            const availablePicks = openMegacollab.pool.items.filter(i => i.status === "picked");
                            const filteredChoices = availablePicks.filter((pick) =>
                                pick.name.toLowerCase().startsWith(focusedValue.toLowerCase())
                            );
                            const results = filteredChoices.map((choice) => {
                                return {
                                    name: `${choice.name} - ${choice.series}`,
                                    value: choice.id
                                }
                            });

                            int.respond(results.slice(0, 25)).catch(() => {});
                        }
                    } finally {
                        mongoClient.close();
                    }
                }
                if (int.options.getSubcommand() === "pick-check") {
                    const focusedValue = int.options.getFocused();
                    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                    try {
                        const allCollabs = await localFunctions.getCollabs(collection);
                        const openMegacollab = allCollabs.find(c => c.restriction === "megacollab");
                        if (typeof openMegacollab === "undefined") {
                            return;
                        } else {
                            const picks = openMegacollab.pool.items;
                            const filteredChoices = picks.filter((pick) =>
                                pick.name.toLowerCase().startsWith(focusedValue.toLowerCase())
                            );
                            const results = filteredChoices.map((choice) => {
                                return {
                                    name: `${choice.name} - ${choice.series}`,
                                    value: choice.id
                                }
                            });

                            int.respond(results.slice(0, 25)).catch(() => {});
                        }
                    } finally {
                        mongoClient.close();
                    }
                }
                if (int.options.getSubcommand() === "user-check") {
                    const focusedValue = int.options.getFocused();
                    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                    try {
                        const allCollabs = await localFunctions.getCollabs(collection);
                        const openMegacollab = allCollabs.find(c => c.restriction === "megacollab");
                        if (typeof openMegacollab === "undefined") {
                            return;
                        } else {
                            if (typeof openMegacollab.participants === "undefined") return;
                            const participants = openMegacollab.participants;
                            const filteredChoices = participants.filter((user) =>
                                user.discordTag.toLowerCase().startsWith(focusedValue.toLowerCase())
                            );
                            const results = filteredChoices.map((choice) => {
                                return {
                                    name: `${choice.discordTag} - ${choice.name} - ${choice.series}`,
                                    value: choice.discordId
                                }
                            });

                            int.respond(results.slice(0, 25)).catch(() => {});
                        }
                    } finally {
                        mongoClient.close();
                    }
                }
                if (int.options.getSubcommand() === "snipe") {
                    const focusedValue = int.options.getFocused();
                    const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
                    try {
                        const allCollabs = await localFunctions.getCollabs(collection);
                        const openMegacollab = allCollabs.find(c => c.restriction === "megacollab" && (c.status !== "delivered" || c.status !== "archived" || c.status !== "completed"));
                        if (typeof openMegacollab === "undefined") {
                            return;
                        } else {
                            const pickedPicks = openMegacollab.participants;
                            const filteredChoices = pickedPicks.filter((pick) =>
                                pick.name.toLowerCase().startsWith(focusedValue.toLowerCase())
                            );
                            const results = filteredChoices.map((choice) => {
                                return {
                                    name: `${choice.name} - ${choice.series} - Picked by: ${choice.username}`,
                                    value: choice.id
                                }
                            });

                            int.respond(results.slice(0, 25)).catch(() => {});
                        }
                    } finally {
                        mongoClient.close();
                    }
                }
            }
        }
    }
}