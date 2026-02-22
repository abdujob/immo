import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { User } from '@prisma/client';

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }

    async create(user: User, dto: CreateReviewDto) {
        // Check if target exists (property or agency)
        if (dto.targetType === 'PROPERTY') {
            const property = await this.prisma.property.findUnique({
                where: { id: dto.propertyId },
            });
            if (!property) throw new NotFoundException('Propriété non trouvée');
        } else if (dto.targetType === 'AGENCY') {
            const agency = await this.prisma.agency.findUnique({
                where: { id: dto.agencyId },
            });
            if (!agency) throw new NotFoundException('Agence non trouvée');
        }

        return this.prisma.review.create({
            data: {
                authorId: user.id,
                rating: dto.rating,
                comment: dto.comment,
                targetType: dto.targetType,
                propertyId: dto.propertyId,
                agencyId: dto.agencyId,
            },
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
        });
    }

    async getPropertyReviews(propertyId: string) {
        return this.prisma.review.findMany({
            where: {
                targetType: 'PROPERTY',
                propertyId,
            },
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
        });
    }

    async getAgencyReviews(agencyId: string) {
        return this.prisma.review.findMany({
            where: {
                targetType: 'AGENCY',
                agencyId,
            },
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
        });
    }
}
