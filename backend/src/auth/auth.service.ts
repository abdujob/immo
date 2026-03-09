import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user exists
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Un utilisateur avec cet email existe déjà');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Generate verification token
        const verificationToken = uuidv4();

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                role: dto.role,
                agencyId: dto.agencyId,
                verificationToken,
                isVerified: false,
            },
            include: {
                agency: true,
            },
        });

        // Send verification email (non-blocking)
        this.mailService.sendVerificationEmail(user.email, verificationToken).catch(err => {
            console.error('Initial verification email failed:', err);
        });

        // Generate token
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                agency: user.agency,
            }
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                agency: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Email ou mot de passe invalide');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Email ou mot de passe invalide');
        }

        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                agency: user.agency,
            }
        };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            throw new UnauthorizedException('Jeton de vérification invalide');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });

        return { message: 'Email vérifié avec succès' };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        // For security reasons, don't throw if user not found
        if (!user) {
            return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
        }

        const resetPasswordToken = uuidv4();
        const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken,
                resetPasswordExpires,
            },
        });

        await this.mailService.sendPasswordResetEmail(user.email, resetPasswordToken);

        return { message: 'Un lien de réinitialisation a été envoyé.' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: dto.token,
                resetPasswordExpires: { gt: new Date() },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Lien invalide ou expiré');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        return { message: 'Mot de passe réinitialisé avec succès' };
    }

    async testMail() {
        return this.mailService.testConnection();
    }
}
