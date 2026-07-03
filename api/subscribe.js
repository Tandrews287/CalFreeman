export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required.' });
    }

    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const API_SERVER = process.env.MAILCHIMP_API_SERVER; // e.g. "us6"
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

    if (!API_KEY || !API_SERVER || !AUDIENCE_ID) {
        console.warn('Mailchimp environment variables missing. Simulating success for testing.');
        return res.status(201).json({ message: 'Simulated success (missing env vars)' });
    }

    const url = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

    const data = {
        email_address: email,
        status: 'subscribed'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `apikey ${API_KEY}`
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 400) {
            const errorData = await response.json();
            // Handle case where user is already subscribed gracefully
            if (errorData.title === 'Member Exists') {
                return res.status(200).json({ message: 'Already subscribed!' });
            }
            return res.status(400).json({ error: errorData.title || 'Error subscribing' });
        }

        return res.status(201).json({ message: 'Success' });
    } catch (error) {
        console.error('Error with Mailchimp API:', error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
