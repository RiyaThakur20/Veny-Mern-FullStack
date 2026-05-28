const axios = require('axios');

const sendEmail = async (options) => {
    try {
        // Brevo API ka endpoint (Standard HTTPS Port 443 use karta hai, jo block nahi hota)
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { 
                    name: "Veny Support", 
                    email: process.env.EMAIL_USER // Aapki Brevo verified email
                },
                to: [{ email: options.email }],
                subject: options.subject,
                textContent: options.message,
                htmlContent: options.html || `
                    <div style="font-family: sans-serif; background: #020617; color: white; padding: 40px; border-radius: 16px; max-width: 480px; margin: auto;">
                        <h1 style="font-size: 32px; font-weight: 900; font-style: italic; letter-spacing: -1px;">
                            VENY<span style="color: #6366f1;">.</span>
                        </h1>
                        <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 32px;">
                            The Elite Marketplace
                        </p>
                        <div style="white-space: pre-line; color: #e2e8f0; font-size: 15px; line-height: 1.8;">
                            ${options.message}
                        </div>
                    </div>
                `
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY, // 👉 Brevo ki API Key Render mein dalenge
                    'content-type': 'application/json'
                },
                timeout: 10000 // Sirf 10 seconds ka timeout (2 minute tak nahi ghumega)
            }
        );

        console.log("✅ Email sent successfully via Brevo API:", response.data);
    } catch (error) {
        console.error("❌ Brevo API Error:", error.response ? error.response.data : error.message);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;