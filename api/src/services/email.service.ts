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
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contact Form Submission</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .field { margin-bottom: 20px; }
                    .label { font-weight: 600; color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
                    .value { font-size: 16px; color: #111827; }
                    .message { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>New Contact Form Submission</h1>
                    <p>You have a new message from your portfolio website</p>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">From</div>
                        <div class="value">${this.escapeHtml(contactDto.name)} <${this.escapeHtml(contactDto.email)}></div>
                    </div>
                    <div class="field">
                        <div class="label">Subject</div>
                        <div class="value">${this.escapeHtml(contactDto.subject)}</div>
                    </div>
                    <div class="field">
                        <div class="label">Message</div>
                        <div class="message">${this.escapeHtml(contactDto.message).replace(/\n/g, '<br>')}</div>
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
