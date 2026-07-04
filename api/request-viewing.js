import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, marketingOptIn, title } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required.' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 465;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const HOST_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (req.headers.host.includes('localhost') ? `http://${req.headers.host}` : `https://${req.headers.host}`);

    if (!JWT_SECRET || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error('Missing environment variables for email or JWT setup.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    // 1. Handle Mailchimp Marketing Opt-In (if true)
    if (marketingOptIn) {
        const MC_KEY = process.env.MAILCHIMP_API_KEY;
        const MC_SERVER = process.env.MAILCHIMP_API_SERVER;
        const MC_AUDIENCE = process.env.MAILCHIMP_AUDIENCE_ID;

        if (MC_KEY && MC_SERVER && MC_AUDIENCE) {
            try {
                const mcUrl = `https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_AUDIENCE}/members`;
                await fetch(mcUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `apikey ${MC_KEY}`
                    },
                    body: JSON.stringify({
                        email_address: email,
                        status: 'subscribed'
                    })
                });
                console.log(`User ${email} added to Mailchimp for marketing.`);
            } catch (err) {
                console.error('Mailchimp marketing opt-in failed:', err);
                // Non-fatal, continue with email process
            }
        }
    }

    // 2. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    try {
        // 3. Send automated reply to the user
        await transporter.sendMail({
            from: `"Cal Freeman" <${SMTP_USER}>`,
            to: email,
            subject: `Request to view: ${title}`,
            text: `Hi it's Cal here.\n\nI saw you wanted to view ${title}. Please bear with me while I get that sorted and I'll send you the link shortly!\n\nBest,\nCal`,
            html: `<p>Hi it's Cal here,</p><p>I saw you wanted to view <strong>${title}</strong>. Please bear with me while I get that sorted and I'll send you the link shortly!</p><p>Best,<br>Cal</p>`
        });

        // 4. Generate JWT token for Cal to approve/deny
        const token = jwt.sign(
            { email: email, title: title },
            JWT_SECRET,
            { expiresIn: '7d' } // Links valid for 7 days
        );

        const approveUrl = `${HOST_URL}/api/resolve-request?token=${token}&action=approve`;
        const denyUrl = `${HOST_URL}/api/resolve-request?token=${token}&action=deny`;

        // 5. Send approval email to Cal
        await transporter.sendMail({
            from: `"Automated System" <${SMTP_USER}>`,
            to: SMTP_USER, // Send to Cal himself
            subject: `[ACTION REQUIRED] Link request for ${title}`,
            html: `
                <p>A user (<strong>${email}</strong>) has requested a link to watch <strong>${title}</strong>.</p>
                <p>Would you like to send it?</p>
                <br/>
                <a href="${approveUrl}" style="padding: 10px 20px; background-color: #188038; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-family: sans-serif; display: inline-block;">YES - Send Link</a>
                &nbsp;&nbsp;
                <a href="${denyUrl}" style="padding: 10px 20px; background-color: #d93025; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-family: sans-serif; display: inline-block;">NO - Deny Request</a>
                <br/><br/>
                <p><small>These links are valid for 7 days.</small></p>
            `
        });

        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send emails.' });
    }
}
