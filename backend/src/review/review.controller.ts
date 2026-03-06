import { Body, Controller, Post, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import type { CreateReviewDto } from './dto/review.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    create(@Request() req, @Body() dto: CreateReviewDto) {
        return this.reviewService.create(req.user, dto);
    }

    @Get('property/:id')
    getPropertyReviews(@Param('id') id: string) {
        return this.reviewService.getPropertyReviews(id);
    }

    @Get('agency/:id')
    getAgencyReviews(@Param('id') id: string) {
        return this.reviewService.getAgencyReviews(id);
    }
}
