import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { token, action } = req.query;

    if (!token || !action) {
        return res.status(400).send('Missing token or action.');
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 465;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const SYCN_LINK = process.env.SYCN_LINK || '#';

    if (!JWT_SECRET || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return res.status(500).send('Server configuration error.');
    }

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(400).send('<h1>Invalid or Expired Link</h1><p>This request link has either expired or is invalid.</p>');
    }

    const { email, title } = payload;

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT == 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    try {
        if (action === 'approve') {
            await transporter.sendMail({
                from: `"Cal Freeman" <${SMTP_USER}>`,
                to: email,
                subject: `Your link for: ${title}`,
                html: `
                    <p>Hi,</p>
                    <p>Thanks for your interest! Here is the private viewing link for <strong>${title}</strong>:</p>
                    <p><a href="${SYCN_LINK}">${SYCN_LINK}</a></p>
                    <p>Please do not share this link publicly.</p>
                    <p>Best,<br>Cal</p>
                `
            });
            return res.status(200).send(`
                <div style="font-family: sans-serif; padding: 40px; text-align: center;">
                    <h1 style="color: #188038;">Request Approved!</h1>
                    <p>The private link has been sent to <strong>${email}</strong>.</p>
                    <p>You can close this tab.</p>
                </div>
            `);
        } else if (action === 'deny') {
            await transporter.sendMail({
                from: `"Cal Freeman" <${SMTP_USER}>`,
                to: email,
                subject: `Update regarding: ${title}`,
                html: `
                    <p>Hi,</p>
                    <p>Sorry, but we cannot provide the link to <strong>${title}</strong> at the minute.</p>
                    <p>We appreciate your patience regardless.</p>
                    <p>Best,<br>Cal</p>
                `
            });
            return res.status(200).send(`
                <div style="font-family: sans-serif; padding: 40px; text-align: center;">
                    <h1 style="color: #d93025;">Request Denied</h1>
                    <p>A polite rejection email has been sent to <strong>${email}</strong>.</p>
                    <p>You can close this tab.</p>
                </div>
            `);
        } else {
            return res.status(400).send('Invalid action.');
        }
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).send('Failed to send resolution email.');
    }
}
