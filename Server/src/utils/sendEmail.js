const nodemailer = require('nodemailer');

/**
 * Utility function to send emails via Gmail SMTP
 * Supports both plain text and HTML messages
 * ✅ IPv4 forced — Render/Railway IPv6 issue fix
 */
const sendEmail = async (options) => {

    // 1. Transporter — Gmail SMTP with IPv4 forced
    const transporter = nodemailer.createTransport({
        host: '172.253.115.108', // 👉 smtp.gmail.com ka direct IPv4 IP address hai yeh!
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Gmail App Password
        },
        tls: {
            rejectUnauthorized: false // ✅ SSL certificate issues avoid
        }
    });

    // 2. Mail options
    const mailOptions = {
        from:    `"Veny Support" <${process.env.EMAIL_USER}>`,
        to:      options.email,
        subject: options.subject,
        text:    options.message,
        html:    options.html || `
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
                <hr style="border-color: rgba(255,255,255,0.1); margin: 32px 0;" />
                <p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                    © Veny — Do not reply to this email.
                </p>
            </div>
        `,
    };

    // 3. Send
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("❌ Email Sending Error:", error.message);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;