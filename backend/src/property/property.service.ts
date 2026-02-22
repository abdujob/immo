import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreatePropertyDto,
    UpdatePropertyDto,
    PropertyFilterDto,
} from './property.dto';

@Injectable()
export class PropertyService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreatePropertyDto) {
        const property = await this.prisma.property.create({
            data: {
                ...dto,
                images: dto['images'] ? JSON.stringify(dto['images']) : null,
                ownerId: userId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true,
                    },
                },
                agency: true,
            },
        });

        return this.formatProperty(property);
    }

    async findAll(filters: PropertyFilterDto) {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            minPrice,
            maxPrice,
            minSurface,
            maxSurface,
            ...whereFilters
        } = filters;

        const skip = (page - 1) * limit;

        const where: any = {
            ...whereFilters,
            ...(minPrice || maxPrice
                ? {
                    price: {
                        ...(minPrice && { gte: minPrice }),
                        ...(maxPrice && { lte: maxPrice }),
                    },
                }
                : {}),
            ...(minSurface || maxSurface
                ? {
                    surface: {
                        ...(minSurface && { gte: minSurface }),
                        ...(maxSurface && { lte: maxSurface }),
                    },
                }
                : {}),
        };

        const [properties, total] = await Promise.all([
            this.prisma.property.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            email: true,
                        },
                    },
                    agency: true,
                    _count: {
                        select: {
                            favorites: true,
                            reviews: true,
                        },
                    },
                },
            }),
            this.prisma.property.count({ where }),
        ]);

        return {
            data: properties.map((p) => this.formatProperty(p)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true,
                        avatar: true,
                    },
                },
                agency: true,
                reviews: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
        });

        if (!property) {
            throw new NotFoundException('Propriété non trouvée');
        }

        // Increment views
        await this.prisma.property.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        return this.formatProperty(property);
    }

    async update(id: string, userId: string, userRole: string, dto: UpdatePropertyDto) {
        const property = await this.prisma.property.findUnique({
            where: { id },
        });

        if (!property) {
            throw new NotFoundException('Propriété non trouvée');
        }

        // Check ownership
        if (property.ownerId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException(
                'Vous n\'êtes pas autorisé à modifier cette propriété',
            );
        }

        const updated = await this.prisma.property.update({
            where: { id },
            data: {
                ...dto,
                images: dto['images'] ? JSON.stringify(dto['images']) : undefined,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true,
                    },
                },
                agency: true,
            },
        });

        return this.formatProperty(updated);
    }

    async remove(id: string, userId: string, userRole: string) {
        const property = await this.prisma.property.findUnique({
            where: { id },
        });

        if (!property) {
            throw new NotFoundException('Propriété non trouvée');
        }

        // Check ownership
        if (property.ownerId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException(
                'Vous n\'êtes pas autorisé à supprimer cette propriété',
            );
        }

        await this.prisma.property.delete({
            where: { id },
        });

        return { message: 'Propriété supprimée avec succès' };
    }

    async getFeatured(limit: number = 6) {
        const properties = await this.prisma.property.findMany({
            where: {
                featured: true,
                status: 'ACTIVE',
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
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
        });

        return properties.map((p) => this.formatProperty(p));
    }

    async getRecent(limit: number = 8) {
        const properties = await this.prisma.property.findMany({
            where: {
                status: 'ACTIVE',
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
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
        });

        return properties.map((p) => this.formatProperty(p));
    }

    async findByOwner(userId: string) {
        const properties = await this.prisma.property.findMany({
            where: {
                ownerId: userId,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true,
                    },
                },
                agency: true,
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
        });

        return properties.map((p) => this.formatProperty(p));
    }

    async getSimilar(propertyId: string, limit: number = 4) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new NotFoundException('Propriété non trouvée');
        }

        const properties = await this.prisma.property.findMany({
            where: {
                id: { not: propertyId },
                status: 'ACTIVE',
                type: property.type,
                city: property.city,
                transactionType: property.transactionType,
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
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
        });

        return properties.map((p) => this.formatProperty(p));
    }

    private formatProperty(property: any) {
        return {
            ...property,
            images: property.images ? JSON.parse(property.images) : [],
        };
    }
}
