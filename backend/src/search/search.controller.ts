import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { SearchService } from './search.service';
import type { SearchDto } from './dto/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    @UsePipes(ZodValidationPipe)
    search(@Query() query: SearchDto) {
        return this.searchService.search(query);
    }
}
