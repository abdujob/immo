import { Controller, Get, Param, Query } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('agencies')
@Controller('agencies')
export class AgencyController {
    constructor(private readonly agencyService: AgencyService) { }

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
    @ApiOperation({ summary: 'Obtenir les propriétés d\'une agence' })
    getProperties(@Param('id') id: string) {
        return this.agencyService.getAgencyProperties(id);
    }
}
