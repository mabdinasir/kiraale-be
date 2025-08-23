export const propertyApprovedTemplate = (
  propertyTitle: string,
  ownerName?: string,
  adminNotes?: string,
) => ({
  subject: '🎉 Your Property Has Been Approved! / Xayeysiiskaaga waa la aqbalay!',
  text: `Great news! Your property "${propertyTitle}" has been approved and is now live on Kiraale.${adminNotes ? `\n\nAdmin notes: ${adminNotes}` : ''}\n\n---\n\nWar wanaagsan! Xayeysiiska gurigaaga "${propertyTitle}" waa la aqbalay wuxuuna hadda ku jiraa Kiraale.${adminNotes ? `\n\nQoraalada maamulka: ${adminNotes}` : ''}`,
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
            .success-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            .property-title {
                background-color: #f0fdf4;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #22C55E;
                margin: 24px 0;
            }
            .admin-notes {
                background-color: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                margin: 24px 0;
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
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <img src="https://kiraale.com/logo.png" alt="Kiraale Logo" class="logo">
                    <div class="success-icon">🎉</div>
                    <h1>Property Approved!</h1>
                </div>

                <p class="greeting">Hi ${ownerName ?? 'there'} / Salaan ${ownerName ?? 'saaxiib'},</p>

                <!-- English Version -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #16A34A; margin-bottom: 16px;">🎉 Great News!</h2>
                    <p>Your property has been approved and is now live on Kiraale.</p>

                    <div class="property-title">
                        <h3 style="margin: 0; color: #16A34A;">"${propertyTitle}"</h3>
                    </div>

                    <p>Your property is now visible to potential buyers and renters on our platform. You can expect inquiries to start coming in soon!</p>
                </div>

                <div style="border-top: 2px solid #e2e8f0; padding-top: 30px;">
                    <h2 style="color: #16A34A; margin-bottom: 16px;">🎉 War Wanaagsan!</h2>
                    <p>Xayeysiiska gurigaaga waa la aqbalay wuxuuna hadda ku jiraa Kiraale.</p>

                    <div class="property-title">
                        <h3 style="margin: 0; color: #16A34A;">"${propertyTitle}"</h3>
                    </div>

                    <p>Gurigaagu hadda wuxuu u muuqan karaa dadka doonaya inay iibsadaan ama kireystaan. Filo in dhawaan lagu la soo xiriiro!</p>
                </div>

                ${
                  adminNotes
                    ? `
                <div class="admin-notes">
                    <h4 style="margin: 0 0 8px 0; color: #374151;">Admin Notes / Qoraalada Maamulka:</h4>
                    <p style="margin: 0; color: #6b7280;">${adminNotes}</p>
                </div>
                `
                    : ''
                }

                <div class="divider"></div>

                <div class="text-muted">
                    <p>Thank you for choosing Kiraale to list your property. We're excited to help you find the right buyer or tenant!</p>
                    <p><em>Waad ku mahadsan tahay inaad u dooratay Kiraale si aad ugu xayeysiiso gurigaaga. Waxaan ku faraxsan nahay inaan ku caawino si aad u hesho iibsade ama kireeyste ku habboon!</em></p>
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
