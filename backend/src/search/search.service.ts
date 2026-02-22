import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async search(dto: SearchDto) {
        const whereClause: any = {
            status: 'ACTIVE',
        };

        // Filter by transaction type (VENTE/LOCATION)
        if (dto.transactionType) {
            whereClause.transactionType = dto.transactionType;
        }

        // Filter by property type
        if (dto.propertyType) {
            whereClause.type = dto.propertyType;
        }

        // Filter by city
        if (dto.city) {
            whereClause.city = dto.city;
        }

        // Filter by district
        if (dto.district) {
            whereClause.district = dto.district;
        }

        // Price range
        if (dto.minPrice || dto.maxPrice) {
            whereClause.price = {};
            if (dto.minPrice) whereClause.price.gte = dto.minPrice;
            if (dto.maxPrice) whereClause.price.lte = dto.maxPrice;
        }

        // Surface range
        if (dto.minSurface || dto.maxSurface) {
            whereClause.surface = {};
            if (dto.minSurface) whereClause.surface.gte = dto.minSurface;
            if (dto.maxSurface) whereClause.surface.lte = dto.maxSurface;
        }

        // Bedrooms
        if (dto.bedrooms) {
            whereClause.bedrooms = { gte: dto.bedrooms };
        }

        // Features
        if (dto.hasParking !== undefined) {
            whereClause.hasParking = dto.hasParking;
        }
        if (dto.hasGarden !== undefined) {
            whereClause.hasGarden = dto.hasGarden;
        }
        if (dto.hasPool !== undefined) {
            whereClause.hasPool = dto.hasPool;
        }

        const properties = await this.prisma.property.findMany({
            where: whereClause,
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
            orderBy: { createdAt: 'desc' },
            take: dto.limit || 20,
        });

        return properties.map((p) => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : [],
        }));
    }
}
