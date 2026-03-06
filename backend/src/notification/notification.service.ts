import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    async getUserNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limite aux 50 dernières
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, read: false },
        });
    }

    async markAsRead(userId: string, notificationId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== userId) {
            throw new NotFoundException('Notification non trouvée');
        }

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
}

