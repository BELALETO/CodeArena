const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // Looking to send emails in production? Check out our Email API/SMTP product!
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.USER_NAME,
      pass: process.env.USER_PASSWORD
    }
  });

  const mailOptions = {
    from: `"CodeArena Support Team" <${process.env.USER_NAME}>`,
    to: options.recipient,
    subject: options.subject || 'No Subject',
    text: options.text || 'No content provided',
    html: options.html || '<p>No content provided</p>'
  };
  // Send the email
  await transport.sendMail(mailOptions);
};
module.exports = sendMail;
