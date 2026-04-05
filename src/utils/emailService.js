const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter using Ethereal (fake SMTP service) for development
    // In production, replace this with SendGrid/Mailgun/etc.
    let transporter;

    if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid for production
        transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    } else {
        // Use Ethereal for development
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    const message = {
        from: '"Bare Beauty Support" <noreply@barebeauty.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
