const { connectToSpreadsheet } = require('../../googleSheets');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { poolCache } = require('../../components/buttons/pool-collab');
const { editCache } = require('../../components/buttons/edit-collab');
const { createCollabCache } = require('../../commands/collabs/collabs');
const { monthlySupporterCache } = require('../../commands/admin/addmonthlysupporter');
const userCooldowns = new Map();
const userCombos = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        if (message.guildId !== '630281137998004224') return;

        const userId = message.author.id;
        const currentTime = Date.now();

        // Check if the message starts with a blacklisted character
        if (localConstants.blacklistedChars.some((char) => message.content.startsWith(char))) {
            return;
        }

        // Check if the channel is blacklisted
        if (localConstants.blacklistedChannels.includes(message.channel.id)) {
            return;
        }

        // Check for cooldown
        if (userCooldowns.has(userId)) {
            const lastMessageTime = userCooldowns.get(userId);
            if (currentTime - lastMessageTime < localConstants.timeInterval) {
                return;
            }
        }

        // Define the start of the day for token bonus
        const startOfDay = new Date(currentTime);
        startOfDay.setHours(0, 0, 0, 0);

        // Grab the MongoDB collections.
        const collection = client.db.collection('OzenCollection');
        const collectionSpecial = client.db.collection('Special');
        const collabCollection = client.db.collection('Collabs');

        const globalBoost = await localFunctions.getGlobalBoost(collectionSpecial);
        const globalBoostEndTime = globalBoost.boostEndTime;
        const globalBoostValue = globalBoost.multiplier;

        messageCheck: try {
            try {
                if (poolCache.size !== 0) { // Pool upload for collabs
                    if (poolCache.get(userId).userId === userId && message.reference.messageId === poolCache.get(userId).messageId && message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (attachment.name.endsWith('.json')) {
                            if (message.author.id !== '687004886922952755') return;
                            const response = await fetch(attachment.url);
                            const buffer = Buffer.from(await response.arrayBuffer());
                            const jsonData = JSON.parse(buffer.toString());
                            const fullCollab = poolCache.get(userId).collab;
                            await localFunctions.setCollabPool(fullCollab.name, jsonData, collabCollection);

                            const doc = await connectToSpreadsheet(fullCollab.spreadsheetID); // Spreadsheet update
                            let initialization = false;
                            let currentIndex = parseInt(jsonData.items[0].sheetIndex);
                            let lastColumn = 0;
                            let sheet;
                            for (let item of jsonData.items) {
                                if (item.coordinate !== lastColumn && lastColumn !== 0) {
                                    initialization = false;
                                    await sheet.saveUpdatedCells();
                                    console.log('Changes for a series have been pushed');
                                }
                                let originCoord = localFunctions.excelSheetCoordinateToRowCol(item.coordinate);
                                let mainRow = originCoord.row + (3 * parseInt(item.localId));
                                let mainCol = originCoord.col;
                                if (!initialization) {
                                    sheet = doc.sheetsByIndex[parseInt(item.sheetIndex)];
                                    currentIndex = parseInt(item.sheetIndex);
                                    initialization = true;
                                    await sheet.loadCells(`${localFunctions.getColumnRange(item.coordinate)}`);
                                    console.log(`Sheet ${currentIndex} loaded.`);
                                }
                                let mainCell = sheet.getCell(mainRow, mainCol);
                                mainCell.borders = { bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: { red: 0.68, green: 0.89, blue: 0.61 } } } };
                                mainCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } }, fontFamily: 'Avenir', fontSize: 10, link: { uri: item.imgURL } };
                                mainCell.value = item.name;
                                let idCell = sheet.getCell(mainRow, mainCol + 1);
                                idCell.borders = { bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: { red: 0.68, green: 0.89, blue: 0.61 } } } };
                                idCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } }, fontFamily: 'Avenir', fontSize: 10 };
                                idCell.value = item.id;
                                let availabilityCell = sheet.getCell(mainRow + 1, mainCol);
                                availabilityCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 0.8, green: 0.8, blue: 0.8 } }, fontFamily: 'Avenir', fontSize: 7 };
                                availabilityCell.value = 'Available';
                                console.log(`Change registered for pick ${item.id}`);
                                lastColumn = item.coordinate;
                            }
                            await sheet.saveUpdatedCells();
                            message.reply('Pool uploaded to the database and spreadsheet succesfully!');
                            sheet.resetLocalCache();
                            poolCache.delete(userId);
                            break messageCheck;
                        }
                    }
                }

                if (createCollabCache.size !== 0) { // Collab Creation
                    if (createCollabCache.get(userId).userId === userId && message.reference.messageId === createCollabCache.get(userId).messageId && message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (attachment.name.endsWith('.json')) {
                            const response = await fetch(attachment.url);
                            const buffer = Buffer.from(await response.arrayBuffer());
                            let jsonData = JSON.parse(buffer.toString());
                            jsonData.host = userId;
                            jsonData.status = 'on design';
                            await localFunctions.setCollab(jsonData, collabCollection);
                            message.reply('New collab created succesfully in the database.');
                            createCollabCache.delete(userId);
                            break messageCheck;
                        }
                    }
                }

                if (editCache.size !== 0) { // Collab Editing
                    if (editCache.get(userId).userId === userId && message.reference.messageId === editCache.get(userId).messageId && message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (attachment.name.endsWith('.json')) {
                            const response = await fetch(attachment.url);
                            const buffer = Buffer.from(await response.arrayBuffer());
                            let jsonData = JSON.parse(buffer.toString());
                            await localFunctions.editCollab(editCache.get(userId).collab.name, jsonData, collabCollection);
                            message.reply('Collab edited succesfully.');
                            editCache.delete(userId);
                            break messageCheck;
                        }
                    }
                }

                if (monthlySupporterCache.size !== 0) {
                    if (monthlySupporterCache.get(userId).userId === userId && message.reference.messageId === monthlySupporterCache.get(userId).messageId && message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (attachment.name.endsWith('.json')) {
                            const response = await fetch(attachment.url);
                            const buffer = Buffer.from(await response.arrayBuffer());
                            let jsonData = JSON.parse(buffer.toString());
                            for (let item of jsonData) {
                                const premiumDiscordId = item.discordId;
                                delete item.name;
                                delete item.discordId;
                                await localFunctions.setUserMontlyPremium(premiumDiscordId, item, collection);
                            }
                            message.reply('User data pushed succesfully.');
                            monthlySupporterCache.delete(userId);
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }

            const messageLength = localFunctions.removeURLsAndColons(message.content).length;
            if (messageLength === 0) {
                break messageCheck;
            }
            let tokensEarned;
            let tokensEarnedNB = (0.1 * messageLength) / (0.5 + (0.00004 * (messageLength ** 2))) * (1.5 - (1.5 * (Math.E ** (-0.2))));

            if (userCombos.has(userId)) {
                const comboData = userCombos.get(userId);

                if (currentTime - comboData.lastMessageTime < localConstants.comboInterval) {
                    let comboBonus = comboData.messages;
                    comboData.lastMessageTime = currentTime;
                    tokensEarned = 20 * Math.log(Math.E, 4 * messageLength * -2.5) * (1.5 - (1.5 * (Math.E ** (-0.02 * (comboBonus + 1)))));
                    if (isNaN(tokensEarned)) {
                        tokensEarned = tokensEarnedNB;
                    }
                    if (messageLength > 20) {
                        comboData.messages++;
                        switch (comboData.messages) {
                        case 30:
                            message.react('💰');
                            tokensEarned += 100;
                            break;
                        case 60:
                            message.react('💰');
                            tokensEarned += 200;
                            break;
                        case 100:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        case 200:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        case 300:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        case 400:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        }
                    }
                    const topCombo = await localFunctions.getTopCombo(userId, collection);
                    if (topCombo < comboData.messages) {
                        await localFunctions.setTopCombo(userId, comboData.messages, collection);
                    }
                } else {
                    comboData.messages = 1;
                    comboData.lastMessageTime = currentTime;
                    tokensEarned = tokensEarnedNB;
                }
            } else {
                userCombos.set(userId, {
                    messages: 1,
                    lastMessageTime: currentTime
                });
                tokensEarned = tokensEarnedNB;
            }

            const currentBalance = await localFunctions.getBalance(userId, collection);
            const currentXp = await localFunctions.getXp(userId, collection);
            const currentLevel = await localFunctions.getLevel(userId, collection);
            const newXp = currentXp + tokensEarned;

            const boostEndTime = await localFunctions.getBoostEndTime(userId, collection);
            if (boostEndTime && currentTime < boostEndTime) {
                // Apply a 2x boost to tokens earned
                tokensEarned *= 2;
            }

            const PermaBoost = await localFunctions.getPermaBoost(userId, collection);
            if (PermaBoost) {
                tokensEarned *= 2;
            }

            if (globalBoostEndTime) {
                if (globalBoostEndTime >= currentTime) {
                    tokensEarned *= globalBoostValue;
                }
            }

            const xpFunction = function (x) {
                return 450 + (50 * (x - 10)) / (1 + 0.01 * Math.abs(x - 10));
            };
            const xpForNextLevel = await localFunctions.trapezoidalRule(0, currentLevel, 1000, xpFunction);
            if (newXp > xpForNextLevel) {
                await localFunctions.setLevel(userId, currentLevel + 1, collection);
                if (currentLevel !== 0) {
                    message.reply(`Congratulations! You've achieved level ${currentLevel + 1}`);
                }
                switch (currentLevel + 1) {
                case 1:
                    message.member.roles.add(localConstants.rolesLevel[0]);
                    break;
                case 5:
                    message.member.roles.add(localConstants.rolesLevel[1]);
                    message.member.roles.remove(localConstants.rolesLevel[0]);
                    break;
                case 10:
                    message.member.roles.add(localConstants.rolesLevel[2]);
                    message.member.roles.remove(localConstants.rolesLevel[1]);
                    break;
                }
            }
            await localFunctions.setXp(userId, newXp, collection);
            const newBalance = currentBalance + tokensEarned;
            await localFunctions.setBalance(userId, newBalance, collection);

            await localFunctions.setLastMessageDate(userId, currentTime, collection);

            userCooldowns.set(userId, currentTime);
        } catch (e) {
            console.log(e);
        }
    }
};

