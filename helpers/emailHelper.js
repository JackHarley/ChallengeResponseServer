'use strict';

const nodeMailer = require('nodemailer');

module.exports.sendEmail = async function(to, subject, content) {
    let transporter = nodeMailer.createTransport({
        sendmail: true,
        path: '/usr/sbin/sendmail'
    });

    try {
        let res = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: to,
            subject: subject,
            text: content
        });

        return true;
    } catch(err) {
        logger.error('Failed to send mail to ' + to + ', subject: ' + subject);
        console.log(err);

        return false;
    }
};