const { perkCache } = require('../../components/selectMenus/use-perks');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: "perk-modal"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const cache = perkCache.get(int.user.id);
        const perk = cache.perk
        try {
            let replies = {};
            let fields = perk.fields;
            for (let field of fields) {
                replies[field.name] = int.fields.getTextInputValue(field.name);
            }
            const toVerify = fields.filter(i => i.type === "url");
            if (typeof toVerify !== "undefined") {
                for (const imageField of toVerify) {
                    let check = await localFunctions.isPNGURL(replies[imageField.name])
                    if (!check) return int.editReply('One or more provided URLs are not a valid PNG...');
                }
            }
            replies.userId = int.user.id;
            replies.perk = perk.name;
            const perkName = perk.name.replace(/ /g, "-");
            replies.downloadURL = `https://storage.googleapis.com/${cache.collab.bucket}/${perkName}-${int.user.id}.png`;
            replies.status = "unclaimed";
            await localFunctions.addPerkIntoCollab(cache.collab.name, collection, perk.name, replies, int.user.id);
            int.editReply('Your entry has been submitted! Use ``/collabs perks`` to manage all of your entries.');
            
        } finally {
            mongoClient.close();
            perkCache.delete(int.user.id);
        }
    },
};