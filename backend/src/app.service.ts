import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getStats() {
    const [propertiesCount, agenciesCount, usersCount] = await Promise.all([
      this.prisma.property.count({ where: { status: 'ACTIVE' } }),
      this.prisma.agency.count({ where: { verified: true } }),
      this.prisma.user.count(),
    ]);

    return {
      propertiesCount,
      agenciesCount,
      usersCount,
    };
  }
}
