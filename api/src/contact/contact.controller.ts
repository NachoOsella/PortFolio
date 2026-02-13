import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { ContactDto } from './dto/contact.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
    submitContactForm(@Body() contactDto: ContactDto): Promise<{ success: boolean }> {
        return this.contactService.submitContactForm(contactDto);
    }
}
