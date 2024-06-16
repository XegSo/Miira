const { collabCache } = require('../buttons/admin-collab');
const { adminCache } = require('../../commands/admin/admin');
const localFunctions = require('../../functions');
const { connectToSpreadsheet } = require('../../googleSheets');

module.exports = {
    data: {
        name: 'pool-collab'
    },
    async execute(int, client) {
        let initializedMap;

        if (collabCache.size > 0) {
            if (typeof collabCache.get(int.user.id) !== 'undefined') {
                initializedMap = collabCache;
            }
        }

        if (adminCache.size > 0) {
            if (typeof adminCache.get(int.user.id) !== 'undefined') {
                initializedMap = adminCache;
            }
        }

        const reply = await int.reply({
            content: 'Please reply to this message with a JSON attachment.',
            fetchReply: true
        });

        const fullCollab = initializedMap.get(int.user.id).collab;
        const filter = (m) => m.author.id === int.user.id && m.reference.messageId === reply.id && m.attachments.size > 0;
        const collector = int.channel.createMessageCollector({ filter, time: 120_000, max: 1 });

        collector.on('collect', async (message) => {
            const attachment = message.attachments.first();

            if (!attachment.name.endsWith('.json')) {
                await message.reply('Not a json file.');
                return;
            }

            if (message.author.id !== '687004886922952755') return;

            try {
                const response = await fetch(attachment.url);
                const jsonData = await response.json();
                const collabCollection = client.db.collection('Collabs');
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
                await message.reply('Pool uploaded to the database and spreadsheet succesfully!');
                sheet.resetLocalCache();
            } catch (err) {
                console.error(err);
                await message.reply(`Error: \`${err}\``);
            }
        });
    }
};
