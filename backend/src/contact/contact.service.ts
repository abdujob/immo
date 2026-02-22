import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './contact.dto';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateContactDto) {
        // Check if property exists
        const property = await this.prisma.property.findUnique({
            where: { id: dto.propertyId },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!property) {
            throw new NotFoundException('Propriété non trouvée');
        }

        const contact = await this.prisma.contact.create({
            data: {
                ...dto,
                senderId: userId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        // Create notification for property owner
        await this.prisma.notification.create({
            data: {
                userId: property.ownerId,
                type: 'CONTACT',
                message: `Nouvelle demande de contact pour "${property.title}"`,
            },
        });

        return contact;
    }

    async findAllReceived(userId: string) {
        const contacts = await this.prisma.contact.findMany({
            where: {
                property: {
                    ownerId: userId,
                },
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        price: true,
                        city: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return contacts;
    }

    async findAllSent(userId: string) {
        const contacts = await this.prisma.contact.findMany({
            where: {
                senderId: userId,
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
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return contacts;
    }

    async updateStatus(id: string, userId: string, status: string) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                property: true,
            },
        });

        if (!contact) {
            throw new NotFoundException('Contact non trouvé');
        }

        // Only property owner can update status
        if (contact.property.ownerId !== userId) {
            throw new NotFoundException('Non autorisé');
        }

        return this.prisma.contact.update({
            where: { id },
            data: { status },
        });
    }
}
