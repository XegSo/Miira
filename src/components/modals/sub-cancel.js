const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'sub-cancel'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const collection = client.db.collection('Users');
        let cancel = int.fields.getTextInputValue('cancel');

        if (cancel === 'yes') {
            await localFunctions.setSubStatus(int.user.id, collection, 'innactive');
            return int.editReply('Your monthly subscription has been canceled.');
        } else {
            return int.editReply('Invalid action.');
        }
    }
};
