import { Resend } from 'resend';
import { config } from '../../config/env.js';

let resendClient = null;

const getResendClient = () => {
    if (!resendClient && config.resendApiKey) {
        resendClient = new Resend(config.resendApiKey);
    }
    return resendClient;
};

export const sendEmail = async ({ to, subject, html, text }) => {
    // In development or test environments, do not require a verified Resend domain
    if (!config.isProduction) {
        if (config.resendApiKey) {
            try {
                const client = getResendClient();
                const response = await client.emails.send({
                    from: config.emailFrom,
                    to: Array.isArray(to) ? to : [to],
                    subject,
                    html,
                    text,
                });

                if (response.error) {
                    console.warn(`[DEV EMAIL MODE] Resend delivery skipped/failed: ${response.error.message || 'Unknown error'}`);
                    return { success: true, simulated: true, devMode: true };
                }

                return { success: true, id: response.data?.id };
            } catch (error) {
                console.warn(`[DEV EMAIL MODE] Resend delivery skipped/failed: ${error.message}`);
                return { success: true, simulated: true, devMode: true };
            }
        }

        // Safe fallback for testing and development environments without API key
        return { success: true, simulated: true, devMode: true };
    }

    // PRODUCTION MODE: Strict Resend dispatch
    if (!config.resendApiKey) {
        console.error('[ResendService] RESEND_API_KEY is not configured in production');
        throw new Error('Email delivery service is not configured');
    }

    try {
        const client = getResendClient();
        const response = await client.emails.send({
            from: config.emailFrom,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
        });

        if (response.error) {
            console.error('[ResendService] Resend API Error:', response.error.message || 'Unknown error');
            throw new Error(response.error.message || 'Email delivery service failure');
        }

        return { success: true, id: response.data?.id };
    } catch (error) {
        console.error('[ResendService] Failed to send email in production:', error.message);
        throw new Error('Email delivery failed. Please try again later.');
    }
};

/**
 * Send customer email verification OTP.
 */
export const sendVerificationOtpEmail = async ({ email, name = 'Customer', otp }) => {
    // In development mode, log the OTP clearly in the backend terminal
    if (!config.isProduction) {
        console.log('\n================================================================');
        console.log(' [DEV EMAIL MODE] CUSTOMER EMAIL VERIFICATION OTP');
        console.log(` Recipient:  ${email}`);
        console.log(` Name:       ${name}`);
        console.log(` OTP Code:   ${otp}`);
        console.log(` Expires In: 10 minutes`);
        console.log('================================================================\n');
    }

    const subject = 'Verify your email - Majedaar Restaurant';
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #faf8f5;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #1b3b2b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">MAJEDAAR RESTAURANT</h1>
            </div>
            <div style="background: #ffffff; padding: 24px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Email Verification</h2>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Hello ${name},</p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Thank you for registering with Majedaar Restaurant. Please use the following One-Time Password (OTP) to verify your email address:</p>
                <div style="text-align: center; margin: 28px 0;">
                    <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1b3b2b; background: #eef2eb; padding: 12px 24px; border-radius: 6px; border: 1px dashed #1b3b2b;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.4;">This verification code is valid for <strong>10 minutes</strong>. For your security, do not share this code with anyone.</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">If you did not request this email, you can safely disregard it.</p>
            </div>
        </div>
    `;

    const text = `Hello ${name},\n\nYour Majedaar Restaurant email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    return sendEmail({ to: email, subject, html, text });
};

/**
 * Send customer password reset OTP.
 */
export const sendPasswordResetOtpEmail = async ({ email, name = 'Customer', otp }) => {
    // In development mode, log the OTP clearly in the backend terminal
    if (!config.isProduction) {
        console.log('\n================================================================');
        console.log(' [DEV EMAIL MODE] CUSTOMER PASSWORD RESET OTP');
        console.log(` Recipient:  ${email}`);
        console.log(` Name:       ${name}`);
        console.log(` OTP Code:   ${otp}`);
        console.log(` Expires In: 10 minutes`);
        console.log('================================================================\n');
    }

    const subject = 'Password Reset Code - Majedaar Restaurant';
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #faf8f5;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #1b3b2b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">MAJEDAAR RESTAURANT</h1>
            </div>
            <div style="background: #ffffff; padding: 24px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Hello ${name},</p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">We received a request to reset the password for your Majedaar Restaurant account. Enter the code below to set a new password:</p>
                <div style="text-align: center; margin: 28px 0;">
                    <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #b91c1c; background: #fee2e2; padding: 12px 24px; border-radius: 6px; border: 1px dashed #b91c1c;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.4;">This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or change your password if you suspect unauthorized access.</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">For security reasons, never share this code with anyone.</p>
            </div>
        </div>
    `;

    const text = `Hello ${name},\n\nYour Majedaar Restaurant password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    return sendEmail({ to: email, subject, html, text });
};
