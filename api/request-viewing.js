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
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'hello@calfreeman.com';
    const CAL_ALERT_EMAIL = process.env.CAL_ALERT_EMAIL || 'hello@calfreeman.com';
    const HOST_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (req.headers.host.includes('localhost') ? `http://${req.headers.host}` : `https://${req.headers.host}`);

    if (!JWT_SECRET || !BREVO_API_KEY) {
        console.error('Missing environment variables for email or JWT setup.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    // 1. Handle Brevo Marketing Opt-In (if true)
    if (marketingOptIn) {
        const BREVO_KEY = process.env.BREVO_API_KEY;
        const BREVO_LIST_ID = process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID, 10) : 2;

        if (BREVO_KEY) {
            try {
                await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'api-key': BREVO_KEY
                    },
                    body: JSON.stringify({
                        email: email,
                        listIds: [BREVO_LIST_ID],
                        updateEnabled: true
                    })
                });
                console.log(`User ${email} added to Brevo for marketing.`);
            } catch (err) {
                console.error('Brevo marketing opt-in failed:', err);
                // Non-fatal, continue with email process
            }
        }
    }

    try {
        // Generate approval links before sending the notification email.
        const token = jwt.sign(
            { email: email, title: title },
            JWT_SECRET, { expiresIn: '7d' }
        );

        const approveUrl = `${HOST_URL}/api/resolve-request?token=${token}&action=approve`;
        const denyUrl = `${HOST_URL}/api/resolve-request?token=${token}&action=deny`;

        const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Cal Freeman', email: SENDER_EMAIL },
                to: [{ email, name: 'Private viewing requester' }],
                subject: `Request to view: ${title}`,
                textContent: `Hi it's Cal here.\n\nI saw you wanted to view ${title}. Please bear with me while I get that sorted and I'll send you the link shortly!\n\nBest,\nCal`,
                htmlContent: `<p>Hi it's Cal here,</p><p>I saw you wanted to view <strong>${title}</strong>. Please bear with me while I get that sorted and I'll send you the link shortly!</p><p>Best,<br>Cal</p>`
            })
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json().catch(() => ({}));
            console.error('Brevo requester email failed:', errorData);
            if (errorData.code === 'unauthorized') {
                return res.status(502).json({
                    error: 'Email provider rejected this server. Add its IP address to Brevo authorised IPs, or use an API key without IP restrictions.'
                });
            }
            return res.status(502).json({ error: 'Failed to send request email.' });
        }

        const alertResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Automated System', email: SENDER_EMAIL },
                to: [{ email: CAL_ALERT_EMAIL, name: 'Cal Freeman' }],
                subject: `[ACTION REQUIRED] Link request for ${title}`,
                htmlContent: `
                <p>A user (<strong>${email}</strong>) has requested a link to watch <strong>${title}</strong>.</p>
                <p>Would you like to send it?</p>
                <br/>
                <a href="${approveUrl}" style="padding: 10px 20px; background-color: #188038; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-family: sans-serif; display: inline-block;">YES - Send Link</a>
                &nbsp;&nbsp;
                <a href="${denyUrl}" style="padding: 10px 20px; background-color: #d93025; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-family: sans-serif; display: inline-block;">NO - Deny Request</a>
                <br/><br/>
                <p><small>These links are valid for 7 days.</small></p>
            `
            })
        });

        if (!alertResponse.ok) {
            const errorData = await alertResponse.json().catch(() => ({}));
            console.error('Brevo alert email failed:', errorData);
            if (errorData.code === 'unauthorized') {
                return res.status(502).json({
                    error: 'Email provider rejected this server. Add its IP address to Brevo authorised IPs, or use an API key without IP restrictions.'
                });
            }
            return res.status(502).json({ error: 'Failed to send request notification.' });
        }

        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send emails.' });
    }
}
