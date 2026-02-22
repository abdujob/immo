import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoriteService {
    constructor(private prisma: PrismaService) { }

    async addFavorite(userId: string, propertyId: string) {
        // Check if property exists
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new NotFoundException('Propriété non trouvée');
        }

        // Check if already favorited
        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('Cette propriété est déjà dans vos favoris');
        }

        const favorite = await this.prisma.favorite.create({
            data: {
                userId,
                propertyId,
            },
            include: {
                property: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                        agency: true,
                    },
                },
            },
        });

        return {
            ...favorite,
            property: this.formatProperty(favorite.property),
        };
    }

    async removeFavorite(userId: string, propertyId: string) {
        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });

        if (!favorite) {
            throw new NotFoundException('Favori non trouvé');
        }

        await this.prisma.favorite.delete({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });

        return { message: 'Favori supprimé avec succès' };
    }

    async getUserFavorites(userId: string) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            include: {
                property: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                        agency: true,
                        _count: {
                            select: {
                                favorites: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return favorites.map((fav) => ({
            ...fav,
            property: this.formatProperty(fav.property),
        }));
    }

    async isFavorite(userId: string, propertyId: string): Promise<boolean> {
        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });

        return !!favorite;
    }

    private formatProperty(property: any) {
        return {
            ...property,
            images: property.images ? JSON.parse(property.images) : [],
        };
    }
}
