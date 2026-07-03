const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required.' });
    }

    // Default to smtp.ionos.co.uk if SMTP_HOST is not provided
    const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ionos.co.uk';
    const SMTP_PORT = process.env.SMTP_PORT || 587;
    const SMTP_EMAIL = process.env.SMTP_EMAIL;
    const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

    if (!SMTP_EMAIL || !SMTP_PASSWORD) {
        console.warn('SMTP credentials missing. Simulating success for testing.');
        return res.status(201).json({ message: 'Simulated success (missing env vars)' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT, 10),
            secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports (like 587)
            auth: {
                user: SMTP_EMAIL,
                pass: SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Cal Freeman Website" <${SMTP_EMAIL}>`, 
            to: SMTP_EMAIL, // Send notification to yourself
            subject: 'New Mailing List Subscriber!',
            text: `You have a new mailing list subscriber!\n\nEmail: ${email}\n\nMake sure to add them to your contacts!`,
            html: `<p>You have a new mailing list subscriber!</p><p><strong>Email:</strong> ${email}</p><p>Make sure to add them to your contacts!</p>`,
        };

        await transporter.sendMail(mailOptions);
        
        return res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (error) {
        console.error('Error sending email via SMTP:', error.message);
        return res.status(500).json({ error: 'Failed to send notification email. Please try again later.' });
    }
};
