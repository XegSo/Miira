const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'sub-change-amount'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const collection = client.db.collection('OzenCollection');

        let newAmmount = parseFloat(int.fields.getTextInputValue('newAmmount'));
        if (isNaN(newAmmount)) {
            return int.editReply('Invalid amount!');
        } else if (newAmmount < 5 || newAmmount % 1 != 0) {
            return int.editReply('Invalid amount! Use a number that is greater or equal to 5 and not decimal.');
        }

        await localFunctions.setSubAmount(int.user.id, collection, newAmmount);
        return int.editReply('Your monthly subscription amount has been edited! Run /premium to check it.');
    }
};
