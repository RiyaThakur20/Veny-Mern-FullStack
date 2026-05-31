const { Resend } = require('resend');

/**
 * Utility function to send emails via Resend
 * ✅ Works perfectly on Render — no IPv6 issues
 * ✅ 3000 emails/month free
 */
const sendEmail = async (options) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from:    'Veny Support <onboarding@resend.dev>', // ✅ Resend default sender
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
        });

        console.log("✅ Email sent to:", options.email);
    } catch (error) {
        console.error("❌ Email Sending Error:", error.message);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;