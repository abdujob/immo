import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgencyService {
    constructor(private prisma: PrismaService) { }

    async findAll(verified?: boolean) {
        const where = verified !== undefined ? { verified } : {};

        const agencies = await this.prisma.agency.findMany({
            where,
            include: {
                _count: {
                    select: {
                        agents: true,
                        properties: true,
                        reviews: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return agencies;
    }

    async findOne(id: string) {
        const agency = await this.prisma.agency.findUnique({
            where: { id },
            include: {
                agents: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatar: true,
                    },
                },
                properties: {
                    where: { status: 'ACTIVE' },
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        _count: {
                            select: {
                                favorites: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
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
                        agents: true,
                        properties: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!agency) {
            throw new NotFoundException('Agence non trouvée');
        }

        // Format properties
        const formattedProperties = agency.properties.map((p) => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : [],
        }));

        return {
            ...agency,
            properties: formattedProperties,
        };
    }

    async getAgencyProperties(id: string) {
        const agency = await this.prisma.agency.findUnique({
            where: { id },
        });

        if (!agency) {
            throw new NotFoundException('Agence non trouvée');
        }

        const properties = await this.prisma.property.findMany({
            where: {
                agencyId: id,
                status: 'ACTIVE',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return properties.map((p) => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : [],
        }));
    }

    async getVerifiedAgencies() {
        return this.findAll(true);
    }
}
