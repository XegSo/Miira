const { collabCache } = require('./admin-collab');
const { adminCache } = require('../../commands/admin/admin');
const localFunctions = require('../../functions');
const { connectToSpreadsheet } = require('../../googleSheets');

module.exports = {
    data: {
        name: 'update-sheet-collab'
    },
    async execute(int) {
        await int.deferReply({ ephemeral: true });
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

        const fullCollab = initializedMap.get(int.user.id).collab;
        int.editReply('Initializing sheet update');
        const doc = await connectToSpreadsheet(fullCollab.spreadsheetID); // Spreadsheet update
        let initialization = false;
        let currentIndex = parseInt(fullCollab.pool.items[0].sheetIndex);
        let lastColumn = 0;
        let sheet;
        for (let item of fullCollab.pool.items) {
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
            const picked = await fullCollab.participants.find(e => e.id === item.id);
            if (typeof picked === 'undefined') {
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
                console.log(`Change registered for available pick ${item.id}`);
            } else {
                let mainCell = sheet.getCell(mainRow, mainCol);
                mainCell.borders = { bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: { red: 0.8549019607843137, green: 0.2823529411764706, blue: 0.2823529411764706 } } } };
                mainCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 0.8549019607843137, green: 0.2823529411764706, blue: 0.2823529411764706 } }, fontFamily: 'Avenir', strikethrough: true, link: { uri: item.imgURL } };
                let idCell = sheet.getCell(mainRow, mainCol + 1);
                idCell.borders = { bottom: { style: 'SOLID_MEDIUM', colorStyle: { rgbColor: { red: 0.8549019607843137, green: 0.2823529411764706, blue: 0.2823529411764706 } } } };
                idCell.textFormat = { foregroundColorStyle: { rgbColor: { red: 0.8549019607843137, green: 0.2823529411764706, blue: 0.2823529411764706 } }, fontFamily: 'Avenir', strikethrough: true };
                let infoCell = sheet.getCell(mainRow + 1, mainCol);
                infoCell.value = `Picked by ${picked.username} on ${new Date(picked.joinDate * 1000).toLocaleString('en-GB', { timeZone: 'UTC', hour12: false })}`;
                console.log(`Change registered for picked pick ${item.id}`);
            }
            lastColumn = item.coordinate;
        }

        await sheet.saveUpdatedCells();
        await int.editReply('Sheet is now up to date!');
        sheet.resetLocalCache();
    }
};
