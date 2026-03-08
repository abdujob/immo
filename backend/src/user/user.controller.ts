import { Controller, Get, Patch, Body, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { multerConfig } from '../config/multer.config';
import { AgencyService } from '../agency/agency.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly agencyService: AgencyService,
    ) { }

    @Get('profile')
    @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
    getProfile(@Request() req) {
        return this.userService.findById(req.user.id);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Mettre à jour le profil' })
    updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(req.user.id, updateUserDto);
    }

    @Patch('avatar')
    @UseInterceptors(FileInterceptor('avatar', multerConfig))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Uploader/Mettre à jour l\'avatar' })
    async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Image requise');
        }
        const avatarPath = `/uploads/${file.filename}`;
        return this.userService.updateAvatar(req.user.id, avatarPath);
    }

    @Get('my-agency')
    @ApiOperation({ summary: 'Obtenir l\'agence de l\'utilisateur connecté' })
    getMyAgency(@Request() req) {
        return this.agencyService.findByAgentId(req.user.id);
    }
}
