import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
    UsePipes,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import type { CreateContactDto } from './contact.dto';
import { CreateContactSchema } from './contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post()
    @UsePipes(new ZodValidationPipe(CreateContactSchema))
    @ApiOperation({ summary: 'Créer une demande de contact' })
    create(@Request() req, @Body() createContactDto: CreateContactDto) {
        console.log('DEBUG: Contact created by user:', {
            id: req.user?.id,
            email: req.user?.email,
            keys: req.user ? Object.keys(req.user) : 'null'
        });
        return this.contactService.create(req.user.id, createContactDto);
    }

    @Get('received')
    @ApiOperation({ summary: 'Obtenir les demandes de contact reçues' })
    findAllReceived(@Request() req) {
        return this.contactService.findAllReceived(req.user.id);
    }

    @Get('sent')
    @ApiOperation({ summary: 'Obtenir les demandes de contact envoyées' })
    findAllSent(@Request() req) {
        return this.contactService.findAllSent(req.user.id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Mettre à jour le statut d\'une demande' })
    updateStatus(
        @Param('id') id: string,
        @Request() req,
        @Body('status') status: string,
    ) {
        return this.contactService.updateStatus(id, req.user.id, status);
    }
}
