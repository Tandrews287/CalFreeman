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
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'hello@calfreeman.com';
    const SYCN_LINK = process.env.SYCN_LINK || '#';

    if (!JWT_SECRET || !BREVO_API_KEY) {
        return res.status(500).send('Server configuration error.');
    }

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(400).send('<h1>Invalid or Expired Link</h1><p>This request link has either expired or is invalid.</p>');
    }

    const { email, title } = payload;
    let emailPayload;
    let successResponse;

    if (action === 'approve') {
        emailPayload = {
            subject: `Your link for: ${title}`,
            htmlContent: `
                <p>Hi,</p>
                <p>Thanks for your interest! Here is the private viewing link for <strong>${title}</strong>:</p>
                <p><a href="${SYCN_LINK}">${SYCN_LINK}</a></p>
                <p>Please do not share this link publicly.</p>
                <p>Best,<br>Cal</p>
            `
        };
        successResponse = `
            <h1 style="color: #188038;">Request Approved!</h1>
            <p>The private link has been sent to <strong>${email}</strong>.</p>
        `;
    } else if (action === 'deny') {
        emailPayload = {
            subject: `Update regarding: ${title}`,
            htmlContent: `
                <p>Hi,</p>
                <p>Sorry, but we cannot provide the link to <strong>${title}</strong> at the minute.</p>
                <p>We appreciate your patience regardless.</p>
                <p>Best,<br>Cal</p>
            `
        };
        successResponse = `
            <h1 style="color: #d93025;">Request Denied</h1>
            <p>A polite rejection email has been sent to <strong>${email}</strong>.</p>
        `;
    } else {
        return res.status(400).send('Invalid action.');
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Cal Freeman', email: SENDER_EMAIL },
                to: [{ email }],
                ...emailPayload
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Brevo resolution email failed:', errorData);
            return res.status(502).send('Failed to send resolution email.');
        }

        return res.status(200).send(`
            <div style="font-family: sans-serif; padding: 40px; text-align: center;">
                ${successResponse}
                <p>You can close this tab.</p>
            </div>
        `);
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).send('Failed to send resolution email.');
    }
}
