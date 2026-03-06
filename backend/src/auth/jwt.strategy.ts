import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
    let token: string | null = null;
    if (req && req.cookies) {
        token = req.cookies['access_token'] as string | undefined ?? null;
    }
    if (!token && req.headers.authorization) {
        token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) as string | null;
    }
    return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: cookieExtractor,
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is missing from environment'); })(),
        });
    }

    async validate(payload: { sub: string, email: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
