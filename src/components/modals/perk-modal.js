const { userCache } = require('../../components/selectMenus/use-perks');
const path = require('path');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: `perk-modal`
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        let jsonPath = '';
        let newObj = [];
        const osuName = int.fields.getTextInputValue("osuName");
        const osuURL = int.fields.getTextInputValue("osuURL");
        const perk = userCache.get(int.user.id).perk;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            let pendingPerks = await localFunctions.getPendingPerks(int.user.id, collection);
            if (perk === "Premium Avatar") {
                jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'avatars.json');
                const avText = int.fields.getTextInputValue("avText");
                const avImageURL = int.fields.getTextInputValue("avImageURL");
                newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, avatarText: avText, image: avImageURL }
                localFunctions.createPerksJSON(jsonPath, newObj);
            } else if (perk === "Premium Cover") {
                jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'covers.json');
                const coverText = int.fields.getTextInputValue("coverText");
                const coverImageURL = int.fields.getTextInputValue("coverImageURL");
                newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, coverText: coverText, image: coverImageURL }
                localFunctions.createPerksJSON(jsonPath, newObj);
            } else if (perk === "Premium Animated Banner") {
                //TBD
            } else if (perk === "Premium Forum Signature") {
                //TBD
            } else if (perk === "Premium Animated Stream Overlay") {
                jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'overlays.json');
                const overlayText = int.fields.getTextInputValue("overlayText");
                const overlayImageURL = int.fields.getTextInputValue("overlayImageURL");
                newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, overlayText: overlayText, image: overlayImageURL }
                localFunctions.createPerksJSON(jsonPath, newObj);
            } else if (perk === "Premium Desktop Wallpaper") {
                //TBD
            } else if (perk === "Premium Collab Poster") {
                //TBD
            } else if (perk === "Megacollab Themed osu! skin") {
                jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'skins.json');
                const skinText = int.fields.getTextInputValue("skinText");
                const skinImageURL = int.fields.getTextInputValue("skinImageURL");
                newObj = { discordId: int.user.id, osuname: osuName, profileURL: osuURL, skinText: skinText, image: skinImageURL }
                localFunctions.createPerksJSON(jsonPath, newObj);
            } else if (perk === "Extra Collab Materials") {
                //TBD
            }
            await localFunctions.setPendingPerks(int.user.id, pendingPerks, perk, collection);
            await int.editReply('Your request was submited succesfully.');
        } finally {
            mongoClient.close();
            userCache.delete(int.user.id);
        }
    },
};