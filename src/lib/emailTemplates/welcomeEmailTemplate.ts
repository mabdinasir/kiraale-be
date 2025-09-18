export const welcomeEmailTemplate = (userName: string, userEmail: string) => ({
  subject: '🎉 Welcome to Kiraale! / Ku soo dhawoow Kiraale!',
  text: `Welcome to Kiraale, ${userName}! Your account has been created successfully and you're now part of a premier real estate platform.\n\n---\n\nKu soo dhawoow Kiraale, ${userName}! Akoonkaagu si guul leh ayaa loo abuuray.`,
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
                margin-bottom: 32px;
                padding-top: 8px;
            }
            .logo {
                max-height: 48px;
                margin-bottom: 20px;
            }
            .welcome-icon {
                font-size: 64px;
                margin-bottom: 20px;
                animation: bounce 2s infinite;
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
            .feature-box {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px solid #22C55E;
                border-radius: 12px;
                padding: 24px;
                margin: 24px 0;
                text-align: center;
            }
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin: 28px 0;
            }
            .feature-item {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                text-align: center;
            }
            .feature-icon {
                font-size: 32px;
                margin-bottom: 12px;
            }
            .button-container {
                margin: 32px 0;
                text-align: center;
            }
            .button {
                display: inline-block;
                background: linear-gradient(90deg, #16A34A 0%, #22C55E 100%);
                color: white;
                padding: 16px 32px;
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
            .social-links {
                margin: 20px 0;
                text-align: center;
            }
            .social-link {
                display: inline-block;
                margin: 0 8px;
                padding: 8px;
                color: #64748b;
                text-decoration: none;
                border-radius: 6px;
                background-color: #f1f5f9;
            }
            .text-center {
                text-align: center;
            }
            .text-muted {
                color: #64748b;
            }
            .greeting {
                font-size: 20px;
                margin-bottom: 24px;
                font-weight: 600;
            }
            .highlight {
                background: linear-gradient(120deg, #22C55E20 0%, #16A34A20 100%);
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <img src="https://kiraale.com/logo.png" alt="Kiraale Logo" class="logo">
                    <div class="welcome-icon">🎉</div>
                    <h1>Welcome to Kiraale!</h1>
                </div>

                <p class="greeting">Hi <span class="highlight">${userName}</span>! / Salaan sare <span class="highlight">${userName}</span>!</p>

                <!-- English Version -->
                <div style="margin-bottom: 40px;">
                    <h2 style="color: #16A34A; margin-bottom: 20px;">🏠 Welcome to Kiraale</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">Your account has been created successfully! You're now part of <strong>Kiraale</strong>, where finding your dream property has never been easier.</p>

                    <div class="feature-box">
                        <h3 style="margin: 0 0 16px 0; color: #16A34A;">🚀 What You Can Do Now:</h3>
                        <p style="margin: 0; font-size: 16px;"><strong>Browse thousands of properties • List your own property • Connect with verified agents</strong></p>
                    </div>

                    <div class="feature-grid">
                        <div class="feature-item">
                            <div class="feature-icon">🔍</div>
                            <h4 style="margin: 0 0 8px 0; color: #374151;">Search Properties</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Find homes, apartments, and commercial spaces</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">📋</div>
                            <h4 style="margin: 0 0 8px 0; color: #374151;">List Your Property</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Reach thousands of potential buyers and renters</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🤝</div>
                            <h4 style="margin: 0 0 8px 0; color: #374151;">Connect with Agents</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Work with verified real estate professionals</p>
                        </div>
                    </div>

                    <div class="button-container">
                        <a href="https://kiraale.com/en/properties" class="button">Start Exploring Properties</a>
                    </div>
                </div>

                <div style="border-top: 2px solid #e2e8f0; padding-top: 40px;">
                    <h2 style="color: #16A34A; margin-bottom: 20px;">🏠 Ku Soo Dhawoow Goobta aad ka Heli Karto Guryaha iyo Dhulalka iibka/kirada ah ee ugu Wanaagsan!</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">Akoonkaaga si guul leh ayaa loo abuuray! Waxaad hadda ka mid tahay <strong>Kiraale</strong>, si sahlan ku hel dhul, guri mise apartment kiro mise iib ah.</p>

                    <div class="feature-box">
                        <h3 style="margin: 0 0 16px 0; color: #16A34A;">🚀 Waxa Aad Hadda Samayn Karto:</h3>
                        <p style="margin: 0; font-size: 16px;"><strong>Baadh kumanaan guri • Xayeysii gurigaaga • La xiriir wakiillo lagu kalsoon yahay</strong></p>
                    </div>

                    <div class="feature-grid">
                        <div class="feature-item">
                            <div class="feature-icon">🔍</div>
                            <h4 style="margin: 0 0 8px 0; color: #374151;">Raadi Guryo</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Hel guryo, apartment-yo, iyo meelaha ganacsiga</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">📋</div>
                            <h4 style="margin: 0 0 8px 0; color: #374151;">Xayeysii Gurigaaga</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Gaadh kumanaan dadka doonaya inay iibsadaan ama kireystaan</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🤝</div>
                            <h4 style="margin: 0 0 8px 0; color: #374151;">La Xiriir Wakiillo</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Kuwaas oo ka shaqeeya kuna takhasusay iibinta iyo kireynta dhulalka iyo guryaha.</p>
                        </div>
                    </div>

                    <div class="button-container">
                        <a href="https://kiraale.com/properties" class="button">Bilow Baadhista Guryo</a>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="text-center" style="margin: 32px 0;">
                    <h3 style="color: #374151; margin-bottom: 16px;">Need Help? / Ma u baahan tahay caawimaad?</h3>
                    <p class="text-muted">Our team is here to help you get started</p>
                    <p class="text-muted"><em>Kooxdayadu waxay halkan u joogtaa si ay kuu caawiso</em></p>

                    <div class="social-links">
                        <a href="mailto:support@kiraale.com" class="social-link">📧 Email Support</a>
                        <a href="https://kiraale.com/en/help" class="social-link">❓ Help Center</a>
                        <a href="https://kiraale.com/en/contact" class="social-link">📞 Contact Us</a>
                    </div>
                </div>

                <div class="text-muted text-center">
                    <p>This email was sent to <strong>${userEmail}</strong> because you created an account with Kiraale.</p>
                    <p><em>Emailkan waxaa loo diray <strong>${userEmail}</strong> maxaa yeelay waxaad ka samaysay akoon Kiraale.</em></p>
                </div>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} Kiraale. All rights reserved.</p>
                    <p style="font-size: 12px; margin-top: 8px;">Made with ❤️ by
                    <a href="https://btj.so" class="social-link">BTJ Software</a>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `,
});
