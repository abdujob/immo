import { Body, Controller, Post, Get, UsePipes, Res, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @UsePipes(ZodValidationPipe)
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(dto);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        return result;
    }

    @Post('login')
    @UsePipes(ZodValidationPipe)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(dto);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        return result;
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        const isProd = process.env.NODE_ENV === 'production';
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
        });
        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('verify')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Post('forgot-password')
    @UsePipes(ZodValidationPipe)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    @UsePipes(ZodValidationPipe)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}
