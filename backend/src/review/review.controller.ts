import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import type { CreateReviewDto } from './dto/review.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateReviewDto) {
        return this.reviewService.create(req.user, dto);
    }
}
