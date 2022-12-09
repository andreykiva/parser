const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS
    }
});

module.exports = mailTransporter;