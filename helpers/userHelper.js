'use strict';

const bcrypt = require('bcrypt');
const emailHelper = require('./emailHelper');

module.exports.checkUser = async function(email, password) {
    try {
        // search for user
        let users = await db.collection('users').find({
            email: email
        }).toArray();
        if (users.length === 0) {
            return false;
        }

        // check activated+password
        let r = await bcrypt.compare(password, users[0].password_hash);
        if ((users[0].verified === false) || (r === false)) {
            return false;
        }

        return users[0];
    } catch(err) {
        throw err;
    }
};

module.exports.sendVerificationEmail = async function(email, key) {
    let link = process.env.SERVER_URL + '/user/verify?key=' + key;

    return await emailHelper.sendEmail(email, 'Verify your account',
`Hi!

Thanks for signing up, please click the link below to verify your account:

${link}

If you did not sign up for our service, please simply disregard this email.

Thanks!`);
};

module.exports.sendForgotPasswordEmail = async function(email, key) {
    let link = process.env.SERVER_URL + '/user/forgotpassword?key=' + key;

    return await emailHelper.sendEmail(email, 'Reset Password',
`Hi!

A password reset was requested for your account, if this was not you, please simply ignore this email.

To change your password, please click the below think and follow the instructions

${link}

Thanks!`);
};