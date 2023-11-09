const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
require('dotenv').config()
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER,
    pass: process.env.APPPASSWORD,
  },
});

function sentOtp(email) {

  const otp = randomstring.generate({
    length: 6,
    charset: 'numeric',
  });


  const mailOptions = {
    from: process.env.MAILER,
    to: email,
    subject: 'Your OTP Code for verification',
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
      console.log('OTP:', otp);
    }
  });
  return otp
}

module.exports = { sentOtp }