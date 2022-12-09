const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
	sendgrid({
		auth: {
			api_key: process.env.SENDGRID_API_KEY,
		},
	})
);

module.exports = transporter;