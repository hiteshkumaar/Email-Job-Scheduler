import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = async () => {
    if (transporter) return transporter;

    // Create Ethereal account if not exists (or use provided valid creds)
    // For production/demo, we'll try to create a test account on the fly if not configured
    // In a real scenario, we'd use persistent credentials from .env

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    console.log('Ethereal Email initialized with user:', testAccount.user);
    return transporter;
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
        from: '"Email Scheduler" <scheduler@example.com>',
        to,
        subject,
        html,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
};
