export const propertyRejectedTemplate = (
  propertyTitle: string,
  rejectionReason: string,
  ownerName?: string,
  adminNotes?: string,
) => ({
  subject: '❌ Property Review Update Required / Cusbooneysiinta Guriga ayaa loo baahan yahay',
  text: `Unfortunately, your property "${propertyTitle}" requires some updates before it can be approved. Reason: ${rejectionReason}${adminNotes ? `\n\nAdmin notes: ${adminNotes}` : ''}\n\n---\n\nNasiib darro, gurigaaga "${propertyTitle}" wuxuu u baahan yahay dhowr cusbooneysiint ka hor intaanu la aqbali karin. Sababta: ${rejectionReason}${adminNotes ? `\n\nQoraalada maamulka: ${adminNotes}` : ''}`,
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
                background: linear-gradient(90deg, #EF4444 0%, #F87171 100%);
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
            .warning-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            .property-title {
                background-color: #fef2f2;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #EF4444;
                margin: 24px 0;
            }
            .rejection-reason {
                background-color: #fef2f2;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #fecaca;
                margin: 24px 0;
            }
            .admin-notes {
                background-color: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                margin: 24px 0;
            }
            .action-steps {
                background-color: #f0f9ff;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #0ea5e9;
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
            .steps-list {
                margin: 16px 0;
                padding-left: 20px;
            }
            .steps-list li {
                margin-bottom: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <img src="https://kiraale.com/logo.png" alt="Kiraale Logo" class="logo">
                    <div class="warning-icon">❌</div>
                    <h1>Property Review Required</h1>
                </div>

                <p class="greeting">Hi ${ownerName ?? 'there'} / Asc wr wb ${ownerName ?? 'saaxiib'},</p>

                <!-- English Version -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #DC2626; margin-bottom: 16px;">📝 Review Required</h2>
                    <p>We've reviewed your property listing and it requires some updates before it can be approved for publication.</p>

                    <div class="property-title">
                        <h3 style="margin: 0; color: #DC2626;">"${propertyTitle}"</h3>
                    </div>

                    <div class="rejection-reason">
                        <h4 style="margin: 0 0 8px 0; color: #DC2626;">Reason for Review:</h4>
                        <p style="margin: 0; color: #7f1d1d; font-weight: 500;">${rejectionReason}</p>
                    </div>
                </div>

                <div style="border-top: 2px solid #e2e8f0; padding-top: 30px; margin-bottom: 30px;">
                    <h2 style="color: #DC2626; margin-bottom: 16px;">📝 Dib u eegis ayaa loo baahan yahay</h2>
                    <p>Waxaan eegnay xayeysiiska gurigaaga wuxuuna u baahan yahay cusbooneysiin ka hor intaan la daabacin.</p>

                    <div class="property-title">
                        <h3 style="margin: 0; color: #DC2626;">"${propertyTitle}"</h3>
                    </div>

                    <div class="rejection-reason">
                        <h4 style="margin: 0 0 8px 0; color: #DC2626;">Sababta dib u eegista:</h4>
                        <p style="margin: 0; color: #7f1d1d; font-weight: 500;">${rejectionReason}</p>
                    </div>
                </div>

                ${
                  adminNotes
                    ? `
                <div class="admin-notes">
                    <h4 style="margin: 0 0 8px 0; color: #374151;">Additional Notes / Qoraalada Dheeriga ah:</h4>
                    <p style="margin: 0; color: #6b7280;">${adminNotes}</p>
                </div>
                `
                    : ''
                }

                <div class="action-steps">
                    <h4 style="margin: 0 0 12px 0; color: #0369a1;">Next Steps / Tillaabooyinka xiga:</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #0369a1;">English:</h5>
                            <ol class="steps-list">
                                <li>Update your property listing to address the feedback above</li>
                                <li>Save your changes to automatically resubmit for review</li>
                                <li>Our team will review your updates within 24-48 hours</li>
                            </ol>
                        </div>
                        <div>
                            <h5 style="margin: 0 0 8px 0; color: #0369a1;">Somali:</h5>
                            <ol class="steps-list">
                                <li>Cusboonaysii qoraalka gurigaaga si mar kale dib u eegis loogu sameeyo</li>
                                <li>Kaydi isbeddelaada si otomaatig ah ayaa loogu soo celin doonaa dib u eegista</li>
                                <li>Kooxdeenu waxay dib u eegi doontaa cusbooneysiintaada 24 saacgudahood</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="text-muted">
                    <p>Don't worry! Most properties need minor adjustments. Once you've made the necessary updates, we'll review your listing again promptly.</p>
                    <p><em>Ha walaaqin! Guriyada intooda badani waxay u baahan yihiin isbeddel yar yar. Markii aad samaysato cusbooneysiinta lagama maarmaanka ah, waxaan dib u eegi doonnaa qoraalkaaga si deg deg ah.</em></p>
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
