import {
    PipeTransform,
    Injectable,
    BadRequestException,
    ArgumentMetadata,
} from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ZodError } from 'zod';

@Injectable()
export class ZodQueryPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type !== 'query') {
            return value;
        }

        try {
            // Convert string numbers to actual numbers for coercion
            const converted = this.convertQueryTypes(value);
            return this.schema.parse(converted);
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                throw new BadRequestException({
                    message: 'Invalid query parameters',
                    errors: messages,
                });
            }
            throw error;
        }
    }

    private convertQueryTypes(obj: any): any {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        const converted = { ...obj };

        // Fields that should be converted to numbers
        const numberFields = ['page', 'limit', 'minPrice', 'maxPrice', 'minSurface', 'maxSurface', 'bedrooms', 'bathrooms'];

        for (const field of numberFields) {
            if (field in converted && converted[field] !== undefined && converted[field] !== '') {
                const num = Number(converted[field]);
                if (!isNaN(num)) {
                    converted[field] = num;
                }
            }
        }

        // Fields that should be converted to booleans
        const booleanFields = ['hasGarden', 'hasParking', 'hasPool', 'isFurnished', 'featured'];

        for (const field of booleanFields) {
            if (field in converted && converted[field] !== undefined) {
                if (converted[field] === 'true') {
                    converted[field] = true;
                } else if (converted[field] === 'false') {
                    converted[field] = false;
                }
            }
        }

        return converted;
    }
}
