import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';

@Controller('uploads')
export class UploadsController {
    @Get(':filename')
    getFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(process.cwd(), 'uploads', filename);

        if (!existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = createReadStream(filePath);
        file.pipe(res);
    }
}
