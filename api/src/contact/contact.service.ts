import { Injectable } from '@nestjs/common';

import { ContactDto } from './dto/contact.dto';
import { EmailService } from '../services/email.service';

@Injectable()
export class ContactService {
    constructor(private readonly emailService: EmailService) {}

    async submitContactForm(contactDto: ContactDto): Promise<{ success: boolean }> {
        await this.emailService.sendContactEmail(contactDto);
        return { success: true };
    }
}
