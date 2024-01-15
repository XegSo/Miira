require('dotenv').config();
const banchoUsername = process.env.OSU_USERNAME_V1;

module.exports = {
    name: 'PM',
    async execute(message, user) {
        if (user.ircUsername === banchoUsername) return;
        if (/^\d+$/.test(message.message)) {
            console.log(message.ircUsername);
            console.log(message.message);
            console.log('A code has been sent!');
        }
    }
}