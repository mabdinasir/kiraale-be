export const propertyExpiredTemplate = (
  propertyTitle: string,
  ownerName?: string,
  daysSinceActive?: number,
) => ({
  subject: '⏰ Your Property Listing Has Expired / Xayeysiiskaaga wuu dhacay',
  text: `Your property "${propertyTitle}" listing has expired after ${daysSinceActive ?? 30} days and is no longer visible to potential buyers/renters. You can easily re-list it anytime to make it active again.\n\n---\n\nXayeysiiska gurigaaga/dhulkaaga "${propertyTitle}" wuu dhacay ${daysSinceActive ?? 30} maalmood ka dib, mana u muuqan doono dadka doonaya inay iibsadaan ama kireystaan. Waxaad mar kasta dib u soo xayeysiisan kartaa si aad mar kale ugu soo bandigto dadka daneynaya.`,
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
                background: linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%);
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
                background-color: #fefce8;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #F59E0B;
                margin: 24px 0;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(90deg, #059669 0%, #10B981 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 16px 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                transition: all 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
            }
            .info-box {
                background-color: #eff6ff;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #bfdbfe;
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
            .feature-list {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .feature-list ul {
                margin: 0;
                padding-left: 20px;
            }
            .feature-list li {
                margin-bottom: 8px;
                color: #374151;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <img src="https://kiraale.com/logo.png" alt="Kiraale Logo" class="logo">
                    <div class="warning-icon">⏰</div>
                    <h1>Property Listing Expired</h1>
                </div>

                <p class="greeting">Hi ${ownerName ?? 'there'} / Salaan sare ${ownerName ?? 'saaxiib'},</p>

                <!-- English Version -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #F59E0B; margin-bottom: 16px;">⏰ Listing Expired</h2>
                    <p>Your property listing has expired after ${daysSinceActive ?? 30} days and is no longer visible to potential buyers and renters.</p>

                    <div class="property-title">
                        <h3 style="margin: 0; color: #F59E0B;">"${propertyTitle}"</h3>
                    </div>

                    <div class="info-box">
                        <h4 style="margin: 0 0 12px 0; color: #1e40af;">📋 What happens when a listing expires?</h4>
                        <div class="feature-list">
                            <ul>
                                <li>Your property is no longer visible in search results</li>
                                <li>Potential buyers/renters cannot view your property details</li>
                                <li>Your property data is safely stored and can be reactivated anytime</li>
                                <li>You won't receive new inquiries until you re-list</li>
                            </ul>
                        </div>
                    </div>

                    <p><strong>Good news:</strong> You can easily re-list your property anytime to make it active again!</p>

                    <div class="text-center">
                        <a href="https://kiraale.com/en/dashboard/properties" class="cta-button">
                            🔄 Re-list Property
                        </a>
                        <a href="https://kiraale.com/en/dashboard" class="cta-button" style="background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);">
                            📊 View Dashboard
                        </a>
                    </div>
                </div>

                <div style="border-top: 2px solid #e2e8f0; padding-top: 30px;">
                    <h2 style="color: #F59E0B; margin-bottom: 16px;">⏰ Xayeysiiskii wuu dhacay</h2>
                    <p>Xayeysiiska gurigaaga wuu dhacay ${daysSinceActive ?? 30} maalmood ka dib, mana u muuqan doono dadka doonaya inay iibsadaan ama kireystaan.</p>

                    <div class="property-title">
                        <h3 style="margin: 0; color: #F59E0B;">"${propertyTitle}"</h3>
                    </div>

                    <div class="info-box">
                        <h4 style="margin: 0 0 12px 0; color: #1e40af;">📋 Maxaa dhacaya marka xayeysiiska dhaco?</h4>
                        <div class="feature-list">
                            <ul>
                                <li>Gurigaagu/dhulkaagu kama muuqan doono natiijada raadinta</li>
                                <li>Dadka doonaya inay iibsadaan/kireystaan ma arki doonaan faahfaahinta gurigaaga/dhulkaaga</li>
                                <li>Xogta gurigaaga/dhulkaaga si amaan ah ayaa loo kaydiyay, waxaana dib loo hawlgelin karaa waqti kasta</li>
                                <li>Ma heli doontid weydiimo cusub ilaa aad dib u soo xayeysiisato</li>
                            </ul>
                        </div>
                    </div>

                    <p><strong>War wanaagsan:</strong> Waxaad si fudud dib u soo xayeysiisan kartaa gurigaaga/dhulkaaga waqti kasta si aad mar kale ugu soo bandhigto dadka daneynaya!</p>

                    <div class="text-center">
                        <a href="https://kiraale.com/en/dashboard/properties" class="cta-button">
                            🔄 Dib u soo xayeysii
                        </a>
                        <a href="https://kiraale.com/en/dashboard" class="cta-button" style="background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);">
                            📊 Arag Dashboard ka
                        </a>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="text-muted">
                    <p><strong>💡 Pro tip:</strong> Re-listing your property will reset the 30-day timer and make it visible again. You can also update your property details before re-listing to attract more interest!</p>
                    <p><em><strong>💡 Talo:</strong> Dib u soo xayeysiinta gurigaaga/dhulkaaga waxay dib u soo celin doontaa 30 maalmoodka xayeysiiska waxayna mar kale u muujin doontaa bulshada. Waxaad sidoo kale cusboonaysiin kartaa faahfaahinta gurigaaga/dhulkaaga ka hor inta aadan dib u soo xayeysiisan si aad u soo jiidato dad badan!</em></p>
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
