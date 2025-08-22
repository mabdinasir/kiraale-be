export const resetPasswordTemplate = (resetUrl: string, userName?: string) => ({
  subject: 'Password Reset Request',
  text: `Please reset your password by clicking this link: ${resetUrl}\n\nThis link expires in 15 minutes.`,
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
                background: linear-gradient(90deg, #16A34A 0%, #22C55E 100%);
                border-radius: 12px 12px 0 0;
            }
            .header {
                text-align: center;
                margin-bottom: 28px;
                padding-top: 8px;
            }
            .logo {
                max-height: 48px;
                margin-bottom: 20px;
            }
            .button-container {
                margin: 28px 0;
                text-align: center;
            }
            .button {
                display: inline-block;
                background: linear-gradient(90deg, #16A34A 0%, #22C55E 100%);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(22, 163, 74, 0.2);
                transition: all 0.2s ease;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(22, 163, 74, 0.3);
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
            .instruction {
                margin-bottom: 24px;
            }
            .expiry-notice {
                background-color: #f1f5f9;
                padding: 12px;
                border-radius: 6px;
                margin-top: 24px;
                text-align: center;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <img src="https://kiraale.com/logo.png" alt="Kiraale Logo" class="logo">
                    <h1>Password Reset</h1>
                </div>

                <p class="greeting">Hi ${userName ?? 'there'},</p>
                <p class="instruction">We received a request to reset your password. Click the button below to set a new password:</p>

                <div class="button-container">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>

                <div class="divider"></div>

                <p class="text-muted">If you didn't request this password reset, please ignore this email or contact our support team.</p>

                <div class="expiry-notice">
                    ⏳ This link expires in 15 minutes
                </div>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} Kiraale. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `,
});
