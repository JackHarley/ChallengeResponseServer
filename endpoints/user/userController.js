'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const assert = require('assert');

module.exports.postRegisterUser = async function(req, res) {
    let email = req.body.email;
    let password = req.body.password;

    if ((email == null) || (password == null)) {
        res.status(400).send('You must provide an email and password').end();
        return;
    }

    try {
        // check for duplicate email
        let users = await db.collection('users').find({'email': email}).toArray();
        if (users.length > 0) {
            res.status(400).send('Email address is already used.').end();
            return;
        }

        // insert new record
        let r = await db.collection('users').insertOne({
            email: email,
            password_hash: await bcrypt.hash(password, saltRounds),
            verified: false,
            date_registered: new Date()
        });

        // verify insertion
        assert.equal(r.insertedCount, 1);

        res.status(201).send();
    } catch(err) {
        res.status(500).send().end();
        logger.error('Failed to register user, please try again later.');
        console.log(err);
    }
};
