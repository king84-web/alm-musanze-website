import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class TransformPipe implements PipeTransform {
  constructor(
    private readonly dto: any,
    private readonly unwantedKeys: string[] = [],
    private readonly keyMap: Record<string, string> = {},
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') return value;


    for (const key of this.unwantedKeys) {
      if (key in value) delete value[key];
    }

    for (const [incomingKey, targetKey] of Object.entries(this.keyMap)) {
      if (value[incomingKey] !== undefined) {
        value[targetKey] = value[incomingKey];
        delete value[incomingKey];
      }
    }

    const object = plainToInstance(this.dto, value, {
      enableImplicitConversion: true,
    });

    const errors = await validate(object, {
      skipMissingProperties: true,
      whitelist: true,
    });
    if (errors.length > 0) throw new BadRequestException(errors);

    return object;
  }
}
