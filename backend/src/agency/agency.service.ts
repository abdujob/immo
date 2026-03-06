import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateAgencyDto {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
}

export interface CreateAgencyDto {
    name: string;
    description?: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website?: string;
}

@Injectable()
export class AgencyService {
    constructor(private prisma: PrismaService) { }

    async findAll(verified?: boolean) {
        const where = verified !== undefined ? { verified } : {};
        return this.prisma.agency.findMany({
            where,
            include: {
                _count: { select: { agents: true, properties: true, reviews: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const agency = await this.prisma.agency.findUnique({
            where: { id },
            include: {
                agents: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true },
                },
                properties: {
                    where: { status: 'ACTIVE' },
                    include: {
                        owner: { select: { id: true, firstName: true, lastName: true } },
                        _count: { select: { favorites: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                reviews: {
                    include: {
                        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { agents: true, properties: true, reviews: true } },
            },
        });

        if (!agency) throw new NotFoundException('Agence non trouvée');

        return {
            ...agency,
            properties: agency.properties.map((p) => ({
                ...p,
                images: p.images ? JSON.parse(p.images) : [],
            })),
        };
    }

    async getAgencyProperties(id: string) {
        const agency = await this.prisma.agency.findUnique({ where: { id } });
        if (!agency) throw new NotFoundException('Agence non trouvée');

        const properties = await this.prisma.property.findMany({
            where: { agencyId: id, status: 'ACTIVE' },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, phone: true } },
                _count: { select: { favorites: true } },
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

    /**
     * Update agency info — only member agents can update
     */
    async update(id: string, userId: string, dto: UpdateAgencyDto) {
        const agency = await this.prisma.agency.findUnique({
            where: { id },
            include: { agents: { select: { id: true } } },
        });

        if (!agency) throw new NotFoundException('Agence non trouvée');
        if (!agency.agents.some((a) => a.id === userId)) {
            throw new ForbiddenException('Vous n\'êtes pas membre de cette agence');
        }

        return this.prisma.agency.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.address && { address: dto.address }),
                ...(dto.city && { city: dto.city }),
                ...(dto.phone && { phone: dto.phone }),
                ...(dto.email && { email: dto.email }),
                ...(dto.website !== undefined && { website: dto.website }),
            },
        });
    }

    /**
     * Create a new agency
     */
    async create(userId: string, dto: CreateAgencyDto) {
        // Create the agency and link the user
        const agency = await this.prisma.agency.create({
            data: {
                name: dto.name,
                description: dto.description || '',
                address: dto.address,
                city: dto.city,
                phone: dto.phone,
                email: dto.email,
                website: dto.website || '',
                agents: {
                    connect: { id: userId }
                }
            }
        });

        // Update the user role to AGENCY_AGENT if needed
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                role: 'AGENCY_AGENT',
                agencyId: agency.id
            }
        });

        return agency;
    }

    /**
     * Update agency logo — only member agents can update
     */
    async updateLogo(id: string, userId: string, logoPath: string) {
        const agency = await this.prisma.agency.findUnique({
            where: { id },
            include: { agents: { select: { id: true } } },
        });

        if (!agency) throw new NotFoundException('Agence non trouvée');
        if (!agency.agents.some((a) => a.id === userId)) {
            throw new ForbiddenException('Vous n\'êtes pas membre de cette agence');
        }

        return this.prisma.agency.update({
            where: { id },
            data: { logo: logoPath },
            select: { id: true, logo: true, name: true },
        });
    }

    /**
     * Get the agency associated to an agent user
     */
    async findByAgentId(userId: string) {
        const agency = await this.prisma.agency.findFirst({
            where: { agents: { some: { id: userId } } },
            include: {
                _count: { select: { agents: true, properties: true, reviews: true } },
            },
        });

        if (!agency) throw new NotFoundException('Aucune agence associée à ce compte');
        return agency;
    }
}
