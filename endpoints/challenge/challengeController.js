'use strict';

const assert = require('assert');
const randomString = require('randomstring');

module.exports.postBegin = async function(req, res) {
    const email = req.body.email;

    if (email == null) {
        res.status(400).send('You must provide an email').end();
        return;
    }

    try {
        // check email exists and is verified
        const users = await db.collection('users').find({email: email, verified: true}).toArray();
        if (users.length < 1) {
            res.status(404).send('Email address does not exist.').end();
            return;
        }

        // insert new record
        const challengeId = randomString.generate({length: 16, charset: 'numeric'});
        const pin = randomString.generate({length: 4, charset: 'numeric'});

        const r = await db.collection('challenges').insertOne({
            challenge_id: challengeId,
            recipient_email: email,
            pin: parseInt(pin),
            blob: randomString.generate({length: 256, charset: 'alphanumeric', capitalization: 'lowercase'}),
            verified: false,
            date: new Date()
        });

        // verify
        assert.equal(r.insertedCount, 1);

        // return new data
        res.status(201).json({
            'challenge_id': challengeId,
            'pin': pin
        }).send();
    } catch(err) {
        res.status(500).send('Failed to initiate challenge, please try again later..').end();
        logger.error('Failed to initiate challenge.');
    }
};

module.exports.getLookup = async function(req, res) {
    const email = req.query.email;
    const pin = req.query.pin;

    if ((email == null) || (pin == null)) {
        res.status(400).send('You must provide an email and PIN.').end();
        return;
    }

    try {
        // try find a challenge
        const challenges = await db.collection('challenges').find({
            recipient_email: email,
            pin: parseInt(pin),
            verified: false,
            date: {$gte: new Date(new Date() - (300 * 1000))} // only challenges < 5 minutes old are valid
        }).toArray();
        if (challenges.length < 1) {
            res.status(404).send('No challenges awaiting this user with the specified PIN.').end();
            return;
        }

        // return data
        res.status(200).json({
            challenge_id: challenges[0].challenge_id,
            blob: challenges[0].blob
        }).send();
    } catch(err) {
        res.status(500).send('Failed to initiate challenge, please try again later..').end();
        logger.error('Failed to initiate challenge.');
    }
};