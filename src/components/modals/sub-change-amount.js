const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: "sub-change-amount"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        let newAmmount = parseFloat(int.fields.getTextInputValue('newAmmount'));
        if (isNaN(newAmmount)) {
            return await int.editReply('Invalid amount!');
        } else if (5 > newAmmount || newAmmount % 1 != 0) {
            return await int.editReply('Invalid amount! Use a number that is greater or equal to 5 and not decimal.');
        }

        try {
            await localFunctions.setSubAmount(int.user.id, collection, newAmmount);
            return await int.editReply('Your monthly subscription amount has been edited! Run /premium to check it.');
        } finally {
            mongoClient.close();
        }
    },
};