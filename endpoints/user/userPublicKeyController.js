'use strict';

const bcrypt = require('bcrypt');
const assert = require('assert');
const userHelper = require('./../../helpers/userHelper');

module.exports.postKey = async function(req, res) {
    let publicKey = req.body.public_key;
    let email = req.body.email;
    let password = req.body.password;

    if ((publicKey == null) || (email == null) || (password == null)) {
        res.status(400).send('You must provide an email, password and new public key').end();
        return;
    }

    try {
        let user = await userHelper.checkUser(email, password);
        if (user === false) {
            res.status(403).send('No such user exists, password incorrect, or not email verified.').end();
            return;
        }

        // check it's not the same
        if (user.public_key === publicKey) {
            res.status(200).send('No change to public key in database necessary.').end();
            return;
        }

        // update
        let r = await db.collection('users').updateOne({
            email: req.body.email
        }, {$set: {
            public_key: publicKey,
            date_key_updated: new Date()
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

module.exports.getKey = async function(req, res) {
    let email = req.query.email;

    if (email == null) {
        res.status(400).send('You must provide an email address to fetch a key for').end();
        return;
    }

    try {
        // search for user
        let users = await db.collection('users').find({
            email: email,
            verified: true,
            public_key: {$ne:null} // non-null pub key
        }).toArray();
        if (users.length === 0) {
            res.status(404).send('No verified user with a registered public key found at that email address.').end();
            return;
        }

        res.status(200).json({
            'email': users[0].email,
            'public_key': users[0].public_key,
            'date_key_updated': users[0].date_key_updated
        }).send();
    } catch(err) {
        res.status(500).send().end();
        logger.error('Failed to fetch user, please try again later.');
        console.log(err);
    }
};