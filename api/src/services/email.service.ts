import { Injectable, Logger } from '@nestjs/common';

import { ContactDto } from '../contact/dto/contact.dto';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    async sendContactEmail(contactDto: ContactDto): Promise<void> {
        this.logger.log(`Contact form submitted by ${contactDto.email}`);
    }
}
