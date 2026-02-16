import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { ContactDto } from '../contact/dto/contact.dto';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly resend: Resend | null = null;
    private readonly contactEmail: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        this.contactEmail = this.configService.get<string>('CONTACT_EMAIL') || 'contact@example.com';

        if (apiKey) {
            this.resend = new Resend(apiKey);
        } else {
            this.logger.warn('RESEND_API_KEY not configured. Contact emails will be logged only.');
        }
    }

    async sendContactEmail(contactDto: ContactDto): Promise<void> {
        this.logger.log(`Contact form submitted by ${contactDto.email}`);

        if (!this.resend) {
            this.logger.warn('Resend not configured. Email not sent.');
            return;
        }

        try {
            const { data, error } = await this.resend.emails.send({
                from: 'Contact Form <onboarding@resend.dev>',
                to: [this.contactEmail],
                subject: `Contact Form: ${contactDto.subject}`,
                html: this.buildEmailHtml(contactDto),
                reply_to: contactDto.email,
            });

            if (error) {
                this.logger.error('Failed to send email:', error);
                throw new Error(`Email failed: ${error.message}`);
            }

            this.logger.log(`Email sent successfully. ID: ${data?.id}`);
        } catch (error) {
            this.logger.error('Error sending email:', error);
            throw error;
        }
    }

    private buildEmailHtml(contactDto: ContactDto): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contact Form Submission</title>
                <style>
                    body {
                        margin: 0;
                        padding: 24px;
                        background: #0e0e0e;
                        color: #eaeaea;
                        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        line-height: 1.6;
                    }
                    .shell {
                        max-width: 680px;
                        margin: 0 auto;
                        border: 1px solid #2a2a2a;
                        background: #151515;
                    }
                    .header {
                        padding: 24px;
                        border-bottom: 1px solid #2a2a2a;
                        background: #1c1c1c;
                    }
                    .eyebrow {
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #9a9a9a;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
                    }
                    h1 {
                        margin: 0;
                        font-size: 24px;
                        line-height: 1.3;
                        color: #eaeaea;
                    }
                    .subtitle {
                        margin: 10px 0 0;
                        color: #9a9a9a;
                        font-size: 14px;
                    }
                    .content {
                        padding: 24px;
                    }
                    .field {
                        margin: 0 0 18px;
                    }
                    .label {
                        margin: 0 0 6px;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: #9a9a9a;
                        font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
                    }
                    .value {
                        color: #eaeaea;
                        font-size: 16px;
                    }
                    .message {
                        margin-top: 8px;
                        border: 1px solid #2a2a2a;
                        background: #1c1c1c;
                        padding: 14px 16px;
                        color: #eaeaea;
                    }
                    .footer {
                        padding: 16px 24px 22px;
                        border-top: 1px solid #2a2a2a;
                        color: #9a9a9a;
                        font-size: 12px;
                    }
                    .accent {
                        color: #c0c0c0;
                    }
                </style>
            </head>
            <body>
                <div class="shell">
                    <div class="header">
                        <p class="eyebrow">Portfolio Contact</p>
                        <h1>New message received</h1>
                        <p class="subtitle">A visitor submitted the contact form on your portfolio site.</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <p class="label">From</p>
                            <div class="value">${this.escapeHtml(contactDto.name)} &lt;${this.escapeHtml(contactDto.email)}&gt;</div>
                        </div>
                        <div class="field">
                            <p class="label">Subject</p>
                            <div class="value">${this.escapeHtml(contactDto.subject)}</div>
                        </div>
                        <div class="field">
                            <p class="label">Message</p>
                            <div class="message">${this.escapeHtml(contactDto.message).replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                    <div class="footer">
                        Reply directly to <span class="accent">${this.escapeHtml(contactDto.email)}</span> to answer.
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
