import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
            const mimetype = file.mimetype;
            let extension = extname(file.originalname); // Fallback
            if (mimetype.includes('jpeg') || mimetype.includes('jpg')) extension = '.jpg';
            else if (mimetype.includes('png')) extension = '.png';
            else if (mimetype.includes('webp')) extension = '.webp';
            else if (mimetype.includes('gif')) extension = '.gif';
            else if (mimetype.includes('mp4')) extension = '.mp4';
            else if (mimetype.includes('webm')) extension = '.webm';
            else if (mimetype.includes('quicktime')) extension = '.mov';

            const uniqueName = `${uuidv4()}${extension}`;
            callback(null, uniqueName);
        },
    }),
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp4|webm|quicktime)$/)) {
            return callback(new Error('Only image and video files are allowed!'), false);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB (increased to allow videos)
    },
};
