'use strict';
const nodemailer = require('nodemailer');
var sender = require('../config').knotSenderAccount;
var senderPassword = require('../config').knotSenderPassword;
// create reusable transporter object using the default SMTP transport
function createTransport() {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender,
            pass: senderPassword
        }
    });
    return transporter;
}

// setup email data with unicode symbols
function mailOptions(email, password) {
    let mailOptions = {
        from: sender, // sender address
        to: email, // list of receivers
        subject: 'Password reseted', // Subject line
        text: 'Your new password is:'+ password
    };
    return mailOptions;
}


// send mail with defined transport object
module.exports.sendMail = function (email,password) {
    var transporter = createTransport(email);
    transporter.sendMail( mailOptions(email, password), (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}
