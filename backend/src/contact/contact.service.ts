import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './contact.dto';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) { }

    async create(senderId: string, dto: CreateContactDto) {
        // Check if property exists
        const property = await this.prisma.property.findUnique({
            where: { id: dto.propertyId },
            select: { id: true, title: true, ownerId: true }
        });

        if (!property) {
            throw new NotFoundException('Propriété non trouvée');
        }

        // Determine recipient
        let recipientId = property.ownerId;

        // If it's a reply (parentId provided), the recipient is the sender of the parent message 
        // (unless the current sender IS that person, then it's the recipient of the parent)
        if (dto.parentId) {
            const parent = await this.prisma.contact.findUnique({
                where: { id: dto.parentId }
            });
            if (parent) {
                recipientId = parent.senderId === senderId ? parent.recipientId : parent.senderId;
            }
        }

        const contact = await this.prisma.contact.create({
            data: {
                message: dto.message,
                phone: dto.phone,
                email: dto.email,
                propertyId: dto.propertyId,
                senderId: senderId,
                recipientId: recipientId,
                parentId: dto.parentId,
                status: 'PENDING'
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                },
                property: {
                    select: { id: true, title: true, city: true }
                }
            }
        });

        // Notify recipient if it's not the owner themselves
        if (recipientId !== senderId) {
            await this.prisma.notification.create({
                data: {
                    userId: recipientId,
                    type: 'CONTACT',
                    message: `Nouveau message pour "${property.title}"`,
                },
            });
        }

        return contact;
    }

    /**
     * Get unique conversation threads for a user
     */
    async getConversations(userId: string) {
        // Find all contacts where user is sender or recipient
        const contacts = await this.prisma.contact.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId }
                ]
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                recipient: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                property: {
                    include: {
                        owner: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by (OtherUser, Property)
        const threadsMap = new Map<string, any>();

        for (const contact of contacts) {
            let otherUser = contact.senderId === userId ? contact.recipient : contact.sender;

            // Fallback for legacy messages where recipientId might be broken/missing
            if (!otherUser) {
                if (contact.senderId === userId) {
                    // We are the sender, but recipient relation is missing. 
                    // Use property owner as the recipient.
                    const owner = (contact.property as any)?.owner;
                    if (owner) {
                        otherUser = {
                            id: (contact.property as any).ownerId,
                            firstName: owner.firstName,
                            lastName: owner.lastName,
                            avatar: owner.avatar
                        } as any;
                    }
                } else {
                    // We are the recipient (implied), but sender relation is missing.
                    // This is rare, but we can't do much without sender info.
                    continue;
                }
            }

            if (!otherUser) continue;

            const threadKey = `${otherUser.id}-${contact.propertyId}`;

            if (!threadsMap.has(threadKey)) {
                threadsMap.set(threadKey, {
                    id: threadKey,
                    otherUser,
                    property: contact.property,
                    lastMessage: {
                        id: contact.id,
                        message: contact.message,
                        createdAt: contact.createdAt,
                        senderId: contact.senderId,
                        status: contact.status
                    },
                    unreadCount: contact.recipientId === userId && contact.status === 'PENDING' ? 1 : 0
                });
            } else {
                if (contact.recipientId === userId && contact.status === 'PENDING') {
                    threadsMap.get(threadKey).unreadCount++;
                }
            }
        }

        return Array.from(threadsMap.values());
    }

    /**
     * Get all messages in a specific thread
     */
    async getThreadMessages(userId: string, otherUserId: string, propertyId: string) {
        // Mark messages as SEEN
        await this.prisma.contact.updateMany({
            where: {
                propertyId,
                senderId: otherUserId,
                recipientId: userId,
                status: 'PENDING'
            },
            data: { status: 'SEEN' }
        });

        // Broaden the search to include cases where recipientId might be point to a "dummy" user
        // but the message logically belongs to the thread between userId and otherUserId for this property.

        // Find property to identify owner
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId }
        });

        const isOtherUserOwner = property?.ownerId === otherUserId;
        const isMeOwner = property?.ownerId === userId;

        return this.prisma.contact.findMany({
            where: {
                propertyId: propertyId,
                OR: [
                    // Standard matching
                    { senderId: userId, recipientId: otherUserId },
                    { senderId: otherUserId, recipientId: userId },
                    // Legacy fallback for sender (user is sender, otherUser is property owner, and it's a first message)
                    ...(isOtherUserOwner ? [{ senderId: userId, parentId: null }] : []),
                    // Legacy fallback for owner recipient (user is property owner, otherUser is sender, and it's a first message)
                    ...(isMeOwner ? [{ recipientId: userId, parentId: null }] : [])
                ]
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    async updateStatus(id: string, userId: string, status: string) {
        const contact = await this.prisma.contact.findUnique({
            where: { id }
        });

        if (!contact) throw new NotFoundException('Contact non trouvé');

        // Either sender or recipient can close a thread / update status 
        // (Simplified logic: allow if involved)
        if (contact.senderId !== userId && contact.recipientId !== userId) {
            throw new NotFoundException('Non autorisé');
        }

        return this.prisma.contact.update({
            where: { id },
            data: { status },
        });
    }

    // Keep these for backward compatibility or simple lists
    async findAllReceived(userId: string) {
        return this.prisma.contact.findMany({
            where: { recipientId: userId },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                property: { select: { id: true, title: true, type: true, price: true, city: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findAllSent(userId: string) {
        return this.prisma.contact.findMany({
            where: { senderId: userId },
            include: {
                recipient: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                property: { select: { id: true, title: true, type: true, price: true, city: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
