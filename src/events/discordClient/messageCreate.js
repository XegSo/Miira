const { connectToMongoDB } = require('../../mongo');
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
    async execute(message) {
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

        // Establish a connection to MongoDB
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        const globalBoost = await localFunctions.getGlobalBoost(collectionSpecial);
        const globalBoostEndTime = globalBoost.boostEndTime;
        const globalBoostValue = globalBoost.multiplier;

        messageCheck: try {
            if (poolCache.size !== 0) { //Pool upload for collabs
                if (poolCache.get(userId).userId === userId && message.reference.messageId === poolCache.get(userId).messageId && message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    if (attachment.name.endsWith('.json')) {
                        if (message.author.id !== "687004886922952755") return;
                        const response = await fetch(attachment.url);
                        const buffer = Buffer.from(await response.arrayBuffer());
                        const jsonData = JSON.parse(buffer.toString());
                        const collabName = poolCache.get(userId).collab;
                        const fullCollab = await localFunctions.getCollab(collabName, collabCollection);
                        await localFunctions.setCollabPool(collabName, jsonData, collabCollection);

                        const doc = await connectToSpreadsheet(fullCollab.spreadsheetID); //Spreadsheet update
                        let initialization = false;
                        let currentIndex = parseInt(jsonData.items[0].sheetIndex);
                        let lastColumn = 0;
                        console.log(currentIndex);
                        let sheet;
                        for (let item of jsonData.items) {
                            if (item.coordinate !== lastColumn && lastColumn !== 0) {
                                initialization = false;
                                await sheet.saveUpdatedCells();
                                console.log("Changes for a series have been pushed");
                            }
                            let originCoord = localFunctions.excelSheetCoordinateToRowCol(item.coordinate);
                            let mainRow = originCoord.row + (3 * parseInt(item.localId))
                            let mainCol = originCoord.col;
                            if (!initialization) {
                                sheet = doc.sheetsByIndex[parseInt(item.sheetIndex)];
                                currentIndex = parseInt(item.sheetIndex);
                                lastSheetIndex = currentIndex;
                                initialization = true;
                                await sheet.loadCells(`${localFunctions.getColumnRange(item.coordinate)}`);
                                console.log(`Sheet ${currentIndex} loaded.`)
                            }
                            let mainCell = sheet.getCell(mainRow, mainCol);
                            mainCell.borders = { bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: { red: 0.68, green: 0.89, blue: 0.61 } } } };
                            mainCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } }, fontFamily: "Avenir", fontSize: 10, link: { uri: item.imgURL } };
                            mainCell.value = item.name;
                            let idCell = sheet.getCell(mainRow, mainCol + 1);
                            idCell.borders = { bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: { red: 0.68, green: 0.89, blue: 0.61 } } } };
                            idCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } }, fontFamily: "Avenir", fontSize: 10 };
                            idCell.value = item.id;
                            let availabilityCell = sheet.getCell(mainRow + 1, mainCol);
                            availabilityCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 0.8, green: 0.8, blue: 0.8 } }, fontFamily: "Avenir", fontSize: 7 };
                            availabilityCell.value = "Available";
                            console.log(`Change registered for pick ${item.id}`)
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

            if (createCollabCache.size !== 0) { //Collab Creation
                if (createCollabCache.get(userId).userId === userId && message.reference.messageId === createCollabCache.get(userId).messageId && message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    if (attachment.name.endsWith('.json')) {
                        const response = await fetch(attachment.url);
                        const buffer = Buffer.from(await response.arrayBuffer());
                        let jsonData = JSON.parse(buffer.toString());
                        jsonData.host = userId;
                        jsonData.status = "on design";
                        console.log(jsonData);
                        await localFunctions.setCollab(jsonData, collabCollection);
                        message.reply('New collab created succesfully in the database.')
                        createCollabCache.delete(userId);
                        break messageCheck;
                    }
                }
            }

            if (editCache.size !== 0) { //Collab Editing
                if (editCache.get(userId).userId === userId && message.reference.messageId === editCache.get(userId).messageId && message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    if (attachment.name.endsWith('.json')) {
                        const response = await fetch(attachment.url);
                        const buffer = Buffer.from(await response.arrayBuffer());
                        let jsonData = JSON.parse(buffer.toString());
                        console.log(jsonData);
                        await localFunctions.editCollab(editCache.get(userId).collab, jsonData, collabCollection);
                        message.reply('Collab edited succesfully.')
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
                        for (item of jsonData) {
                            console.log(item);
                            const premiumDiscordId = item.discordId
                            delete item.name;
                            delete item.discordId;
                            await localFunctions.setUserMontlyPremium(premiumDiscordId, item, collection);
                        }
                        message.reply('User data pushed succesfully.');
                        monthlySupporterCache.delete(userId);
                    }
                }
            }

            const messageLength = localFunctions.removeURLsAndColons(message.content).length; // Clean and calculate the message length 
            if (messageLength === 0) {
                break messageCheck;
            }
            console.log(`User: ${message.author.tag}`);
            console.log(`Message length: ${messageLength}`);
            let tokensEarned;
            let tokensEarnedNB = (0.1 * messageLength) / (0.5 + (0.00004 * (messageLength ** 2))) * (1.5 - (1.5 * (Math.E ** (-0.2))));
            console.log(`Tokens earned without bonus: ${tokensEarnedNB}`);

            // Check if the user has an active combo
            if (userCombos.has(userId)) {
                const comboData = userCombos.get(userId);

                // Check if the user's combo is still active
                if (currentTime - comboData.lastMessageTime < localConstants.comboInterval) {
                    console.log(`Current combo ${comboData.messages}`);
                    let comboBonus = comboData.messages;
                    comboData.lastMessageTime = currentTime;
                    tokensEarned = 20 * Math.log(Math.E, 4 * messageLength * -2.5) * (1.5 - (1.5 * (Math.E ** (-0.02 * (comboBonus + 1)))));
                    if (isNaN(tokensEarned)) {
                        console.log('An issue in the token function has been encountered.')
                        tokensEarned = tokensEarnedNB;
                    }
                    console.log(`Tokens earned with bonus: ${tokensEarned}`);
                    if (messageLength > 20) {
                        comboData.messages++; // Increment the number of messages in the combo
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
                    const topCombo = await localFunctions.getTopCombo(userId, collection); // Fetch top combo from the database
                    if (topCombo < comboData.messages) {
                        await localFunctions.setTopCombo(userId, comboData.messages, collection); // Store top combo in the database
                    }
                } else {
                    // Combo has expired, reset combo data
                    comboData.messages = 1; // Reset the message count
                    comboData.lastMessageTime = currentTime;
                    console.log("User has lost its combo.");
                    tokensEarned = tokensEarnedNB;
                    console.log(`Tokens earned: ${tokensEarned}`);
                }
            } else {
                // User doesn't have an active combo, start a new one
                userCombos.set(userId, {
                    messages: 1,
                    lastMessageTime: currentTime,
                });
                console.log("Starting this user's combo.");
                tokensEarned = tokensEarnedNB;
                console.log(`Tokens earned: ${tokensEarned}`);
            }

            const currentBalance = await localFunctions.getBalance(userId, collection); // Fetch user's balance from the database
            const hasLevel = localConstants.rolesLevel.filter(roleId => message.member.roles.cache.find(role => role.id === roleId));

            if (hasLevel.length !== 0) {
                switch (hasLevel[hasLevel.length - 1]) {
                    case '630980373374828544':
                        if (currentBalance > 200) {
                            message.member.roles.remove(localConstants.rolesLevel[0]);
                            message.member.roles.add(localConstants.rolesLevel[1]);
                        }
                        break;
                    case '739111130034733108':
                        if (currentBalance > 300) {
                            message.member.roles.remove(localConstants.rolesLevel[0]);
                            message.member.roles.remove(localConstants.rolesLevel[1]);
                            message.member.roles.add(localConstants.rolesLevel[2]);
                        }
                        break;
                    case '739111062682730507':
                        if (hasLevel.length !== 1) {
                            message.member.roles.remove(localConstants.rolesLevel[0]);
                            message.member.roles.remove(localConstants.rolesLevel[1]);
                        }
                }
            } else if (currentBalance > 120) {
                message.member.roles.add(localConstants.rolesLevel[0]);
            }

            // Check if the user has an active boost
            const boostEndTime = await localFunctions.getBoostEndTime(userId, collection); // Fetch boost end time from the database
            if (boostEndTime && currentTime < boostEndTime) {
                // Apply a 2x boost to tokens earned
                tokensEarned *= 2;
                console.log(`Tokens earned with active boost: ${tokensEarned}`);
            }

            const PermaBoost = await localFunctions.getPermaBoost(userId, collection); // Fetch perma boost status from the database
            if (PermaBoost) {
                tokensEarned *= 2;
                console.log(`Tokens earned with active PERMA boost: ${tokensEarned}`);
            }

            const lastMessageDate = await localFunctions.getLastMessageDate(userId, collection); // Fetch the last message date for the user from the database

            if (typeof lastMessageDate === "undefined") {
                tokensEarned += 100;
                console.log('First message of the user in the server since the system was created, assigning 100 tokens bonus.');
                message.react('868437778004836372');
            }

            if (globalBoostEndTime) {
                if (globalBoostEndTime < currentTime) {
                    console.log('Current global Boost has expired! Not applying.');
                } else {
                    tokensEarned *= globalBoostValue;
                    console.log(`Tokens earned with active Global boost: ${tokensEarned}`);
                }
            }

            if (!lastMessageDate || lastMessageDate < startOfDay.getTime()) {
                // It's the user's first message, give them an extra 20 tokens
                tokensEarned += 80;
                console.log('First message of the user, assigning 80 tokens bonus.');
                message.react('💸');
            }


            //Update user's balance in the database
            const newBalance = currentBalance + tokensEarned;
            await localFunctions.setBalance(userId, newBalance, collection);

            // Store the date of the message in the database
            await localFunctions.setLastMessageDate(userId, currentTime, collection);

            // Set cooldown
            userCooldowns.set(userId, currentTime);

            // Log activity (optional)
            console.log(`${message.author.tag} earned ${tokensEarned} Mirage Tokens.\n`);
        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
            mongoClientCollabs.close();
        }
    }
}