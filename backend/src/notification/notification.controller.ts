import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    getUserNotifications(@Request() req) {
        return this.notificationService.getUserNotifications(req.user.id);
    }

    @Get('unread-count')
    getUnreadCount(@Request() req) {
        return this.notificationService.getUnreadCount(req.user.id);
    }

    @Patch('read-all')
    markAllAsRead(@Request() req) {
        return this.notificationService.markAllAsRead(req.user.id);
    }

    @Patch(':id/read')
    markAsRead(@Request() req, @Param('id') id: string) {
        return this.notificationService.markAsRead(req.user.id, id);
    }
}

