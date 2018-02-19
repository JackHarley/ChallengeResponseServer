'use strict';

const bcrypt = require('bcrypt');

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