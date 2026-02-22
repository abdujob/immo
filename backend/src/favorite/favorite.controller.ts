import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) { }

    @Get()
    @ApiOperation({ summary: 'Obtenir tous les favoris de l\'utilisateur' })
    getUserFavorites(@Request() req) {
        return this.favoriteService.getUserFavorites(req.user.userId);
    }

    @Post(':propertyId')
    @ApiOperation({ summary: 'Ajouter une propriété aux favoris' })
    addFavorite(@Request() req, @Param('propertyId') propertyId: string) {
        return this.favoriteService.addFavorite(req.user.userId, propertyId);
    }

    @Delete(':propertyId')
    @ApiOperation({ summary: 'Retirer une propriété des favoris' })
    removeFavorite(@Request() req, @Param('propertyId') propertyId: string) {
        return this.favoriteService.removeFavorite(req.user.userId, propertyId);
    }

    @Get(':propertyId/check')
    @ApiOperation({ summary: 'Vérifier si une propriété est en favori' })
    async isFavorite(@Request() req, @Param('propertyId') propertyId: string) {
        const isFavorite = await this.favoriteService.isFavorite(
            req.user.userId,
            propertyId,
        );
        return { isFavorite };
    }
}
