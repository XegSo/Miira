const { userCache } = require('../../components/selectMenus/use-perks');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: {
        name: `perk-modal`
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        let jsonPath = '';
        let newObj = [];
        let existingData = []
        const osuName = int.fields.getTextInputValue("osuName");
        const osuURL = int.fields.getTextInputValue("osuURL");
        const perk = userCache.get(int.user.id).perk;
        if (perk === "Premium Avatar") {
            jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'avatars.json');
            const avText = int.fields.getTextInputValue("avText");
            const avImageURL = int.fields.getTextInputValue("avImageURL");
            newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, avatarText: avText, image: avImageURL }
            if (fs.existsSync(jsonPath)) {
                const jsonData = fs.readFileSync(jsonPath, 'utf-8');
                existingData = JSON.parse(jsonData);
                const existingObjIndex = existingData.findIndex(obj => obj.discordId === newObj.discordId);

                if (existingObjIndex !== -1) {
                    existingData[existingObjIndex] = newObj;
                } else {
                    existingData.push(newObj);
                }    
            } else {
                existingData.push(newObj);
            }
            fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
            console.log('New data added into avatars.json');
            int.editReply('Your request was submited succesfully.');
        } else if (perk === "Premium Cover") {
            jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'covers.json');
            const coverText = int.fields.getTextInputValue("coverText");
            const coverImageURL = int.fields.getTextInputValue("coverImageURL");
            newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, coverText: coverText, image: coverImageURL }
            if (fs.existsSync(jsonPath)) {
                const jsonData = fs.readFileSync(jsonPath, 'utf-8');
                existingData = JSON.parse(jsonData);
                const existingObjIndex = existingData.findIndex(obj => obj.discordId === newObj.discordId);

                if (existingObjIndex !== -1) {
                    existingData[existingObjIndex] = newObj;
                } else {
                    existingData.push(newObj);
                }    
            } else {
                existingData.push(newObj);
            }
            fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
            console.log('New data added into cover.json');
            int.editReply('Your request was submited succesfully.');
        } else if (perk === "Premium Animated Banner") {
            //TBD
        } else if (perk === "Premium Forum Signature") {
            //TBD
        } else if (perk === "Premium Animated Stream Overlay") {
            jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'overlays.json');
            const overlayText = int.fields.getTextInputValue("overlayText");
            const overlayImageURL = int.fields.getTextInputValue("overlayImageURL");
            newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, overlayText: overlayText, image: overlayImageURL }
            if (fs.existsSync(jsonPath)) {
                const jsonData = fs.readFileSync(jsonPath, 'utf-8');
                existingData = JSON.parse(jsonData);
                const existingObjIndex = existingData.findIndex(obj => obj.discordId === newObj.discordId);

                if (existingObjIndex !== -1) {
                    existingData[existingObjIndex] = newObj;
                } else {
                    existingData.push(newObj);
                }    
            } else {
                existingData.push(newObj);
            }
            fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
            console.log('New data added into overlays.json');
            int.editReply('Your request was submited succesfully.');
        } else if (perk === "Premium Desktop Wallpaper") {
            //TBD
        } else if (perk === "Premium Collab Poster") {
            //TBD
        } else if (perk === "Megacollab Themed osu! skin") {
            jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'skins.json');
            const skinText = int.fields.getTextInputValue("skinText");
            const skinImageURL = int.fields.getTextInputValue("skinImageURL");
            newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, skinText: skinText, image: skinImageURL }
            if (fs.existsSync(jsonPath)) {
                const jsonData = fs.readFileSync(jsonPath, 'utf-8');
                existingData = JSON.parse(jsonData);
                const existingObjIndex = existingData.findIndex(obj => obj.discordId === newObj.discordId);

                if (existingObjIndex !== -1) {
                    existingData[existingObjIndex] = newObj;
                } else {
                    existingData.push(newObj);
                }    
            } else {
                existingData.push(newObj);
            }
            fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
            console.log('New data added into skins.json');
            int.editReply('Your request was submited succesfully.');
        } else if (perk === "Extra Collab Materials") {
            //TBD
        }

        userCache.delete(int.user.id);

    },
};