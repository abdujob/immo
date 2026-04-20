import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    UsePipes,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PropertyService } from './property.service';
import type {
    CreatePropertyDto,
    UpdatePropertyDto,
    PropertyFilterDto,
} from './property.dto';
import {
    CreatePropertySchema,
    UpdatePropertySchema,
    PropertyFilterSchema,
} from './property.dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodQueryPipe } from '../common/pipes/zod-query.pipe';
import { ZodError } from 'zod';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { multerConfig } from '../config/multer.config';

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
    constructor(private readonly propertyService: PropertyService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('AGENCY_AGENT', 'ADMIN', 'INDIVIDUAL')
    @ApiBearerAuth()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 3 }
    ], multerConfig))
    @ApiOperation({ summary: 'Créer une nouvelle propriété' })
    create(
        @Request() req,
        @Body() body: any,
        @UploadedFiles() files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] }
    ) {
        // Convert string booleans to actual booleans
        const parsedBody: any = {
            ...body,
            price: parseFloat(body.price),
            surface: parseFloat(body.surface),
            bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
            bathrooms: body.bathrooms ? parseInt(body.bathrooms) : undefined,
            hasParking: body.hasParking === 'true' || body.hasParking === true,
            hasGarden: body.hasGarden === 'true' || body.hasGarden === true,
            hasPool: body.hasPool === 'true' || body.hasPool === true,
            isFurnished: body.isFurnished === 'true' || body.isFurnished === true,
            hasAirCon: body.hasAirCon === 'true' || body.hasAirCon === true,
            hasGuardian: body.hasGuardian === 'true' || body.hasGuardian === true,
        };

        if (!req.user || req.user.isVerified === false) {
            throw new ForbiddenException('Veuillez valider votre email pour créer une annonce.');
        }

        try {
            // Log received data for debugging
            console.log('Received form data:', {
                bodyKeys: Object.keys(body),
                bodyPreview: { ...body, description: body.description?.substring(0, 50) + '...' }
            });

            const createPropertyDto = CreatePropertySchema.parse(parsedBody);

            // Create final DTO with all required fields and defaults
            const finalDto: any = {
                ...createPropertyDto,
                title: createPropertyDto.title || '',
                description: createPropertyDto.description || '',
                status: 'ACTIVE',
            };

            // Add image paths if files exist
            if (files?.images && files.images.length > 0) {
                finalDto.images = files.images.map(file => `/uploads/${file.filename}`);
            } else {
                finalDto.images = null;
            }

            // Add video paths if files exist
            if (files?.videos && files.videos.length > 0) {
                finalDto.videos = files.videos.map(file => `/uploads/${file.filename}`);
            } else {
                finalDto.videos = null;
            }

            return this.propertyService.create(req.user.id, finalDto);
        } catch (error) {
            if (error instanceof ZodError) {
                console.error('Validation Error for property creation:', JSON.stringify(error.issues, null, 2));
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    }))
                });
            }
            console.error('Unexpected error:', error);
            throw error;
        }
    }

    @Get()
    @UsePipes(new ZodQueryPipe(PropertyFilterSchema))
    @ApiOperation({ summary: 'Lister toutes les propriétés avec filtres' })
    findAll(@Query() filters: PropertyFilterDto) {
        return this.propertyService.findAll(filters);
    }

    @Get('featured')
    @ApiOperation({ summary: 'Obtenir les propriétés en vedette' })
    getFeatured(@Query('limit') limit?: string) {
        return this.propertyService.getFeatured(limit ? parseInt(limit) : 6);
    }

    @Get('recent')
    @ApiOperation({ summary: 'Obtenir les propriétés récentes' })
    getRecent(@Query('limit') limit?: string) {
        return this.propertyService.getRecent(limit ? parseInt(limit) : 8);
    }

    @Get('my-properties')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtenir mes propriétés' })
    getMyProperties(@Request() req) {
        return this.propertyService.findByOwner(req.user.id);
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Obtenir une propriété par ID' })
    findOne(@Param('id') id: string, @Request() req) {
        return this.propertyService.findOne(id, req.user);
    }

    @Get(':id/similar')
    @ApiOperation({ summary: 'Obtenir des propriétés similaires' })
    getSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
        return this.propertyService.getSimilar(id, limit ? parseInt(limit) : 4);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('AGENCY_AGENT', 'ADMIN', 'INDIVIDUAL')
    @ApiBearerAuth()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 3 }
    ], multerConfig))
    @ApiOperation({ summary: 'Mettre à jour une propriété' })
    update(
        @Param('id') id: string,
        @Request() req,
        @Body() body: any,
        @UploadedFiles() files: { images?: Express.Multer.File[], videos?: Express.Multer.File[] }
    ) {
        const updateData: any = { ...body };

        // Convert types
        if (body.price) updateData.price = parseFloat(body.price);
        if (body.surface) updateData.surface = parseFloat(body.surface);
        if (body.bedrooms) updateData.bedrooms = parseInt(body.bedrooms);
        if (body.bathrooms) updateData.bathrooms = parseInt(body.bathrooms);

        ['hasParking', 'hasGarden', 'hasPool', 'isFurnished', 'hasAirCon', 'hasGuardian'].forEach(field => {
            if (field in body) updateData[field] = body[field] === 'true' || body[field] === true;
        });

        try {
            const updatePropertyDto = UpdatePropertySchema.parse(updateData);
            const finalUpdateData: any = { ...updatePropertyDto };

            // Handle images
            let images: string[] = [];
            if (body.existingImages) {
                images = Array.isArray(body.existingImages) ? body.existingImages : [body.existingImages];
            }

            if (files?.images) {
                const newImages = files.images.map(file => `/uploads/${file.filename}`);
                images = [...images, ...newImages];
            }

            if (images.length > 0 || (files?.images && files.images.length > 0)) {
                finalUpdateData.images = JSON.stringify(images);
            } else if (body.existingImages && Array.isArray(body.existingImages) && body.existingImages.length === 0) {
                finalUpdateData.images = JSON.stringify([]);
            }

            // Handle videos
            let videos: string[] = [];
            if (body.existingVideos) {
                videos = Array.isArray(body.existingVideos) ? body.existingVideos : [body.existingVideos];
            }

            if (files?.videos) {
                const newVideos = files.videos.map(file => `/uploads/${file.filename}`);
                videos = [...videos, ...newVideos];
            }

            if (videos.length > 0 || (files?.videos && files.videos.length > 0)) {
                finalUpdateData.videos = JSON.stringify(videos);
            } else if (body.existingVideos && Array.isArray(body.existingVideos) && body.existingVideos.length === 0) {
                finalUpdateData.videos = JSON.stringify([]);
            }

            return this.propertyService.update(
                id,
                req.user.id,
                req.user.role,
                finalUpdateData,
            );
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException({ message: 'Validation failed', errors: (error as any).issues });
            }
            throw error;
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('AGENCY_AGENT', 'ADMIN', 'INDIVIDUAL')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Supprimer une propriété' })
    remove(@Param('id') id: string, @Request() req) {
        return this.propertyService.remove(id, req.user.id, req.user.role);
    }
}
