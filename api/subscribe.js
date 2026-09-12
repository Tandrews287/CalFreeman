export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body || {};

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required.' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID, 10) : 2;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'hello@calfreeman.com';
    const CAL_ALERT_EMAIL = process.env.CAL_ALERT_EMAIL || 'hello@calfreeman.com';

    if (!BREVO_API_KEY) {
        console.warn('BREVO_API_KEY missing. Simulating success for testing.');
        return res.status(201).json({ message: 'Simulated success (missing env vars)' });
    }

    try {
        // 1. Add/update contact in Brevo list
        const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                email: email,
                listIds: [BREVO_LIST_ID],
                updateEnabled: true
            })
        });

        const isNewContact = contactResponse.status === 201;
        const isUpdatedContact = contactResponse.status === 204;

        if (!contactResponse.ok && !isUpdatedContact) {
            const errorData = await contactResponse.json().catch(() => ({}));
            if (errorData.code === 'duplicate_parameter' || errorData.message?.includes('already exist')) {
                return res.status(200).json({ message: 'Already subscribed!' });
            }
            console.error('Brevo Contact API error:', errorData);
            return res.status(400).json({ error: errorData.message || 'Error subscribing' });
        }

        // 2. Send notification email to Cal
        try {
            await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'api-key': BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: {
                        name: 'Keep up with Cal',
                        email: SENDER_EMAIL
                    },
                    to: [
                        {
                            email: CAL_ALERT_EMAIL,
                            name: 'Cal Freeman'
                        }
                    ],
                    subject: `New Subscriber: ${email}`,
                    htmlContent: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                            <h2 style="margin-top: 0; color: #111827;">New Marketing Subscriber 🎉</h2>
                            <p style="font-size: 16px; color: #374151;">
                                <strong>${email}</strong> has signed up to receive marketing updates from your website.
                            </p>
                            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
                                They have been automatically added to your Brevo contact list (List #${BREVO_LIST_ID}).
                            </p>
                        </div>
                    `
                })
            });
        } catch (emailErr) {
            console.error('Failed to send Cal notification email:', emailErr);
            // Contact is still saved, so proceed with success
        }

        return res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (error) {
        console.error('Error with Brevo integration:', error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
