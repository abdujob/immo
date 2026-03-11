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
    ForbiddenException,
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
        if (!req.user || req.user.isVerified === false) {
            throw new ForbiddenException('Veuillez valider votre email pour envoyer un message.');
        }

        console.log('DEBUG: Contact created by user:', {
            id: req.user?.id,
            email: req.user?.email,
            keys: req.user ? Object.keys(req.user) : 'null'
        });
        return this.contactService.create(req.user.id, createContactDto);
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Obtenir les conversations (fils de discussion) de l\'utilisateur' })
    getConversations(@Request() req) {
        return this.contactService.getConversations(req.user.id);
    }

    @Get('thread/:otherUserId/:propertyId')
    @ApiOperation({ summary: 'Obtenir tous les messages d\'une discussion spécifique' })
    getThreadMessages(
        @Request() req,
        @Param('otherUserId') otherUserId: string,
        @Param('propertyId') propertyId: string
    ) {
        return this.contactService.getThreadMessages(req.user.id, otherUserId, propertyId);
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
