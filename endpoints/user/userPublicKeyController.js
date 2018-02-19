'use strict';

const bcrypt = require('bcrypt');
const assert = require('assert');

module.exports.postSetKey = async function(req, res) {
    let publicKey = req.body.public_key;
    let email = req.body.email;
    let password = req.body.password;

    if ((publicKey == null) || (email == null) || (password == null)) {
        res.status(400).send('You must provide an email, password and new public key').end();
        return;
    }

    try {
        // search for user
        let users = await db.collection('users').find({
            email: email
        }).toArray();
        if (users.length === 0) {
            res.status(404).send('No such user found, or the password provided was incorrect.').end();
            return;
        }

        // check password
        let r = await bcrypt.compare(password, users[0].password_hash);
        if (r === false) {
            res.status(403).send('No such user found, or the password provided was incorrect.').end();
            return;
        }

        // check it's not the same
        if (users[0].public_key === publicKey) {
            res.status(200).send('No change to public key in database necessary.').end();
            return;
        }

        // update
        r = await db.collection('users').updateOne({
            email: req.body.email
        }, {$set: {
            public_key: publicKey
        }});

        // verify
        assert.equal(r.matchedCount, 1);
        assert.equal(r.modifiedCount, 1);

        res.status(204).send();
    } catch(err) {
        res.status(500).send().end();
        logger.error('Failed to update public key for user, please try again later.');
        console.log(err);
    }
};