export const accountSuspensionTemplate = (
  userName: string,
  userEmail: string,
  suspensionReason: string,
  adminNotes?: string,
) => ({
  subject: '⚠️ Account Suspension Notice / Ogeysiis Hakinta Akoon',
  text: `Your Kiraale account has been suspended.\n\nReason: ${suspensionReason}${adminNotes ? `\n\nAdmin notes: ${adminNotes}` : ''}\n\nPlease contact our support team if you believe this is an error.\n\n---\n\nAkoonkaaga Kiraale waa la hakiyey/xannibay.\n\nSababta: ${suspensionReason}${adminNotes ? `\n\nQoraalada maamulka: ${adminNotes}` : ''}\n\nFadlan la xiriir kooxda taageerada haddii aad u malayso in khalad dhacay.`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
        <style type="text/css">
            body {
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 40px 20px;
                color: #1f2937;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
            }
            .card {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                            0 4px 6px -2px rgba(0, 0, 0, 0.05);
                padding: 40px;
                border: 1px solid #e2e8f0;
                position: relative;
            }
            .card:before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg, #DC2626 0%, #EF4444 100%);
                border-radius: 12px 12px 0 0;
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
                padding-top: 8px;
            }
            .logo {
                max-height: 48px;
                margin-bottom: 20px;
            }
            .warning-icon {
                font-size: 64px;
                margin-bottom: 20px;
                color: #DC2626;
            }
            .suspension-notice {
                background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
                border: 2px solid #DC2626;
                border-radius: 12px;
                padding: 24px;
                margin: 28px 0;
                text-align: center;
            }
            .reason-box {
                background-color: #FEF2F2;
                border-left: 4px solid #DC2626;
                padding: 20px;
                border-radius: 8px;
                margin: 24px 0;
            }
            .admin-notes {
                background-color: #F1F5F9;
                border: 1px solid #CBD5E1;
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
            }
            .contact-box {
                background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
                border: 2px solid #0EA5E9;
                border-radius: 12px;
                padding: 24px;
                margin: 28px 0;
                text-align: center;
            }
            .button-container {
                margin: 24px 0;
                text-align: center;
            }
            .button {
                display: inline-block;
                background: linear-gradient(90deg, #0EA5E9 0%, #0284C7 100%);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(14, 165, 233, 0.2);
                transition: all 0.2s ease;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(14, 165, 233, 0.3);
            }
            .divider {
                height: 1px;
                background: linear-gradient(90deg, rgba(226, 232, 240, 0) 0%, #e2e8f0 50%, rgba(226, 232, 240, 0) 100%);
                margin: 32px 0;
            }
            .footer {
                margin-top: 32px;
                font-size: 14px;
                color: #64748b;
                text-align: center;
            }
            .text-center {
                text-align: center;
            }
            .text-muted {
                color: #64748b;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 24px;
            }
            .highlight {
                background: linear-gradient(120deg, #EF444420 0%, #DC262620 100%);
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
                color: #DC2626;
            }
            .important-text {
                color: #DC2626;
                font-weight: 600;
            }
            .next-steps {
                background-color: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
            }
            .step-item {
                padding: 8px 0;
                border-bottom: 1px solid #E2E8F0;
            }
            .step-item:last-child {
                border-bottom: none;
            }
            .social-links {
                margin: 20px 0;
                text-align: center;
            }
            .social-link {
                display: inline-block;
                margin: 0 8px;
                padding: 8px 16px;
                color: #0EA5E9;
                text-decoration: none;
                border-radius: 6px;
                background-color: #F0F9FF;
                border: 1px solid #BAE6FD;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <img src="https://kiraale.com/logo.png" alt="Kiraale Logo" class="logo">
                    <div class="warning-icon">⚠️</div>
                    <h1 style="color: #DC2626;">Account Suspension Notice</h1>
                </div>

                <p class="greeting">Hi <span class="highlight">${userName}</span> / Salaan <span class="highlight">${userName}</span>,</p>

                <!-- English Version -->
                <div style="margin-bottom: 40px;">
                    <div class="suspension-notice">
                        <h2 style="margin: 0 0 16px 0; color: #DC2626;">🚫 Your Account Has Been Suspended</h2>
                        <p style="margin: 0; font-size: 16px;"><strong>Your Kiraale account access has been temporarily restricted.</strong></p>
                    </div>

                    <div class="reason-box">
                        <h3 style="margin: 0 0 12px 0; color: #DC2626;">📋 Suspension Reason</h3>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">${suspensionReason}</p>
                    </div>

                    ${
                      adminNotes
                        ? `
                    <div class="admin-notes">
                        <h4 style="margin: 0 0 12px 0; color: #374151;">👨‍💼 Additional Information from Admin</h4>
                        <p style="margin: 0; color: #6B7280; font-style: italic;">${adminNotes}</p>
                    </div>
                    `
                        : ''
                    }

                    <div class="next-steps">
                        <h3 style="margin: 0 0 16px 0; color: #374151;">🔄 What Happens Next?</h3>
                        <div class="step-item">
                            <strong>Review:</strong> Our team will review your account status regularly
                        </div>
                        <div class="step-item">
                            <strong>Appeal:</strong> You can contact support to discuss this suspension
                        </div>
                        <div class="step-item">
                            <strong>Resolution:</strong> Follow any specific instructions provided by our team
                        </div>
                    </div>

                    <div class="contact-box">
                        <h3 style="margin: 0 0 16px 0; color: #0EA5E9;">💬 Need to Discuss This?</h3>
                        <p style="margin: 0 0 16px 0;">If you believe this suspension is an error or want to appeal, please contact our support team.</p>
                        <div class="button-container">
                            <a href="mailto:support@kiraale.com?subject=Account Suspension Appeal - ${userEmail}" class="button">Contact Support</a>
                        </div>
                    </div>
                </div>

                <div style="border-top: 2px solid #e2e8f0; padding-top: 40px;">
                    <div class="suspension-notice">
                        <h2 style="margin: 0 0 16px 0; color: #DC2626;">🚫 Akoonkaaga Waa La Hakiyey/Xannibay</h2>
                        <p style="margin: 0; font-size: 16px;"><strong>Gelitaanka akoonkaaga Kiraale waqtigan wuu xaddidan yahay.</strong></p>
                    </div>

                    <div class="reason-box">
                        <h3 style="margin: 0 0 12px 0; color: #DC2626;">📋 Sababta Hakinta</h3>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">${suspensionReason}</p>
                    </div>

                    ${
                      adminNotes
                        ? `
                    <div class="admin-notes">
                        <h4 style="margin: 0 0 12px 0; color: #374151;">👨‍💼 Macluumaad Dheeraad ah oo ka Socda Maamulka</h4>
                        <p style="margin: 0; color: #6B7280; font-style: italic;">${adminNotes}</p>
                    </div>
                    `
                        : ''
                    }

                    <div class="next-steps">
                        <h3 style="margin: 0 0 16px 0; color: #374151;">🔄 Maxaa Xiga?</h3>
                        <div class="step-item">
                            <strong>Dib u eegis:</strong> Kooxdayadu si joogto ah ayay u dib u eegi doontaa xaaladda akoonkaaga
                        </div>
                        <div class="step-item">
                            <strong>Codsi:</strong> Waxaad la xiriiri kartaa kooxda taagerada macaamiisha si aad ugala hadasho hakintan
                        </div>
                        <div class="step-item">
                            <strong>Xal:</strong> Raac tilmaamaha gaarka ah ee ay bixiso kooxdayada
                        </div>
                    </div>

                    <div class="contact-box">
                        <h3 style="margin: 0 0 16px 0; color: #0EA5E9;">💬 Ma Doonaysaa Inaad Ka Hadashid?</h3>
                        <p style="margin: 0 0 16px 0;">Haddii aad u malaynayso in hakintani khalad tahay, fadlan la xiriir kooxda taageerada macaamiisha.</p>
                        <div class="button-container">
                            <a href="mailto:support@kiraale.com?subject=Codsin Hakinta Akoon - ${userEmail}" class="button">La Xiriir Taageera</a>
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="text-center">
                    <div class="social-links">
                        <a href="mailto:support@kiraale.com" class="social-link">📧 Email Support</a>
                        <a href="https://kiraale.com/en/help" class="social-link">❓ Help Center</a>
                        <a href="https://kiraale.com/en/contact" class="social-link">📞 Contact Us</a>
                    </div>
                </div>

                <div class="text-muted text-center">
                    <p class="important-text">⚠️ <strong>Important:</strong> This suspension affects all services including property listing, searching, and messaging.</p>
                    <p class="important-text"><em>⚠️ <strong>Muhiim:</strong> Hakintani waxay saameynaysaa dhammaan adeegyada oo ay ku jiraan liiska guryo, baadhid, iyo farriin.</em></p>
                    <br>
                    <p>This email was sent to <strong>${userEmail}</strong> regarding your Kiraale account suspension.</p>
                    <p><em>Emailkan waxaa loo diray <strong>${userEmail}</strong> oo ku saabsan hakinta akoonkaaga Kiraale.</em></p>
                </div>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} Kiraale. All rights reserved.</p>
                    <p style="font-size: 12px; margin-top: 8px;">This is an automated security notification</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `,
});
