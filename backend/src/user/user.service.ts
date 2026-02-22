import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                createdAt: true,
                agency: {
                    select: {
                        id: true,
                        name: true,
                        logo: true
                    }
                }
            }
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                updatedAt: true
            }
        });
    }

    async updateAvatar(id: string, avatarPath: string) {
        return this.prisma.user.update({
            where: { id },
            data: { avatar: avatarPath },
            select: {
                id: true,
                avatar: true
            }
        });
    }
}
