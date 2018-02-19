'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const assert = require('assert');
const randomString = require('randomstring');

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
            verification_key: randomString.generate({
                length: 32,
                charset: 'alphanumeric',
                capitalization: 'lowercase'
            }),
            date_registered: new Date()
        });

        // verify
        assert.equal(r.insertedCount, 1);

        res.status(201).send();
    } catch(err) {
        res.status(500).send().end();
        logger.error('Failed to register user, please try again later.');
        console.log(err);
    }
};

module.exports.putVerifyUser = async function(req, res) {
    let key = req.query.key;

    if (key == null) {
        res.status(400).send('You must provide a valid verification key.').end();
        return;
    }

    try {
        // search for user
        let users = await db.collection('users').find({
            verified: false,
            verification_key: key
        }).toArray();
        if (users.length === 0) {
            res.status(404).send('No such verification key found.').end();
            return;
        }

        // mark as verified
        let r = await db.collection('users').updateOne({
            verified: false,
            verification_key: key
        }, {$set: {
            verified: true
        }});

        // verify
        assert.equal(r.matchedCount, 1);
        assert.equal(r.modifiedCount, 1);

        res.status(200).send();
    } catch(err) {
        res.status(500).send().end();
        logger.error('Failed to verify user, please try again later.');
        console.log(err);
    }
};
