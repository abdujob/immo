import {
    Controller, Get, Patch, Post, Param, Query, Body,
    UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { AgencyService } from './agency.service';
import type { UpdateAgencyDto, CreateAgencyDto } from './agency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { multerConfig } from '../config/multer.config';

@ApiTags('agencies')
@Controller('agencies')
export class AgencyController {
    constructor(private readonly agencyService: AgencyService) { }

    // ─── PUBLIC ROUTES ────────────────────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: 'Lister toutes les agences' })
    findAll(@Query('verified') verified?: string) {
        const isVerified = verified === 'true' ? true : verified === 'false' ? false : undefined;
        return this.agencyService.findAll(isVerified);
    }

    @Get('verified')
    @ApiOperation({ summary: 'Obtenir les agences vérifiées' })
    getVerified() {
        return this.agencyService.getVerifiedAgencies();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir une agence par ID' })
    findOne(@Param('id') id: string) {
        return this.agencyService.findOne(id);
    }

    @Get(':id/properties')
    @ApiOperation({ summary: "Obtenir les propriétés d'une agence" })
    getProperties(@Param('id') id: string) {
        return this.agencyService.getAgencyProperties(id);
    }

    // ─── PROTECTED ROUTES (agents only) ───────────────────────────────────────

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Mettre à jour les informations de l'agence" })
    update(@Param('id') id: string, @Request() req, @Body() dto: UpdateAgencyDto) {
        return this.agencyService.update(id, req.user.userId, dto);
    }

    @Patch(':id/logo')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('logo', multerConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: "Mettre à jour le logo de l'agence" })
    async updateLogo(
        @Param('id') id: string,
        @Request() req,
        @UploadedFile() file: any,
    ) {
        if (!file) throw new BadRequestException('Image requise');
        const logoPath = `/uploads/${file.filename}`;
        return this.agencyService.updateLogo(id, req.user.userId, logoPath);
    }

    // ─── POST (Création Agence) ──────────────────────────────────────────────

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Créer une nouvelle agence (Onboarding)" })
    create(@Request() req, @Body() dto: CreateAgencyDto) {
        return this.agencyService.create(req.user.userId, dto);
    }
}
